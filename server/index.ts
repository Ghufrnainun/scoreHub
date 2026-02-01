import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { MatchManager, MatchState, MatchRole } from './match-manager';

const PORT = parseInt(process.env.SOCKET_PORT || '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const ADMIN_PIN = process.env.ADMIN_PIN || '';
const GLOBAL_ADMIN_PIN = process.env.ADMIN_PIN;

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const matchManager = new MatchManager();

const getSafeMatch = (match: MatchState, role?: MatchRole) => {
  const { adminPin, refereeToken, ...safeMatch } = match;
  return safeMatch;
};

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api/admin', (req, res, next) => {
  if (!ADMIN_PIN) {
    return next();
  }
  const provided = req.header('x-admin-pin');
  if (!provided || provided !== ADMIN_PIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
});

app.get('/api/admin/matches', (req, res) => {
  const matches = matchManager.listMatches().map((m) => ({
    matchId: m.matchId,
    sport: m.sport,
    status: m.status,
    teams: { home: m.teams.home.name, away: m.teams.away.name },
    scores: { home: m.teams.home.score, away: m.teams.away.score },
    updatedAt: Date.now(),
  }));
  res.json(matches);
});

app.get('/api/matches', (req, res) => {
  const matches = matchManager.listMatches().map((m) => ({
    matchId: m.matchId,
    sport: m.sport,
    status: m.status,
    teams: { home: m.teams.home.name, away: m.teams.away.name },
  }));
  res.json(matches);
});

app.post('/api/matches', (req, res) => {
  const { matchId, sport, teams, pin, templateId, gameMode, category } =
    req.body;

  if (!matchId || !sport || !teams?.home || !teams?.away || !pin) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = matchManager.getMatch(matchId);
  if (existing) {
    return res.status(409).json({ error: 'Match already exists' });
  }

  // Support both simple string team names and full team objects
  const homeTeam =
    typeof teams.home === 'string'
      ? { name: teams.home, score: 0, players: [{ name: teams.home }] }
      : {
          name: teams.home.name,
          score: 0,
          country: teams.home.country,
          logo: teams.home.logo,
          players: teams.home.players || [{ name: teams.home.name }],
        };

  const awayTeam =
    typeof teams.away === 'string'
      ? { name: teams.away, score: 0, players: [{ name: teams.away }] }
      : {
          name: teams.away.name,
          score: 0,
          country: teams.away.country,
          logo: teams.away.logo,
          players: teams.away.players || [{ name: teams.away.name }],
        };

  const match = matchManager.createMatch({
    matchId,
    sport,
    teams: { home: homeTeam, away: awayTeam },
    pin,
    templateId: templateId || 'modern',
    gameMode: gameMode || 'single',
    category,
  });

  res.status(201).json({
    matchId: match.matchId,
    status: match.status,
    message: 'Match created',
    refereeToken: match.refereeToken,
  });
});

app.get('/api/matches/:id', (req, res) => {
  const match = matchManager.getMatch(req.params.id);
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }
  // Don't expose PIN
  const { adminPin, ...safeMatch } = match;
  res.json(safeMatch);
});

app.delete('/api/matches/:id', (req, res) => {
  const { pin } = req.body;
  const match = matchManager.getMatch(req.params.id);

  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  if (match.adminPin !== pin) {
    return res.status(403).json({ error: 'Invalid PIN' });
  }

  matchManager.deleteMatch(req.params.id);
  io.to(req.params.id).emit('match:ended');
  res.json({ message: 'Match deleted' });
});

// Socket authentication middleware
io.use((socket, next) => {
  const { matchId, role, pin, token } = socket.handshake.auth;

  if (!matchId) {
    return next(new Error('Match ID required'));
  }

  // Validate role
  if (!['admin', 'referee', 'display'].includes(role)) {
    return next(new Error('Invalid role'));
  }

  const match = matchManager.getMatch(matchId);

  if (role === 'admin') {
    const expectedPin = GLOBAL_ADMIN_PIN || match?.adminPin;
    if (expectedPin && expectedPin !== pin) {
      return next(new Error('Invalid PIN'));
    }
  }

  if (role === 'referee') {
    const tokenOk = token && match?.refereeToken === token;
    const pinOk = match?.adminPin && match.adminPin === pin;
    if (!tokenOk && !pinOk) {
      return next(new Error('Invalid referee token'));
    }
  }

  socket.data.matchId = matchId;
  socket.data.role = role as MatchRole;
  next();
});

io.on('connection', (socket: Socket) => {
  const { matchId, role } = socket.data;

  console.log(`[${role}] connected to match: ${matchId}`);

  // Join match room
  socket.join(matchId);

  // Send current state on connect
  const match = matchManager.getMatch(matchId);
  if (match) {
    socket.emit('match:state', getSafeMatch(match, role));
  }

  // Handle match creation (admin only)
  socket.on(
    'match:create',
    (data: {
      sport: string;
      teams: { home: any; away: any };
      pin: string;
      templateId?: string;
      gameMode?: 'single' | 'double';
      category?: 'MS' | 'WS' | 'MD' | 'WD' | 'XD';
    }) => {
      if (role !== 'admin') {
        socket.emit('error:permission', 'Only admin can create matches');
        return;
      }

      const match = matchManager.createMatch({
        matchId,
        sport: data.sport,
        teams: {
          home: data.teams.home,
          away: data.teams.away,
        },
        pin: data.pin,
        templateId: data.templateId || 'modern',
        gameMode: data.gameMode,
        category: data.category,
      });

      io.to(matchId).emit('match:state', getSafeMatch(match, role));
    },
  );

  // Handle score updates (referee only)
  socket.on(
    'score:update',
    (data: { team: 'home' | 'away'; delta: number }) => {
      if (role !== 'referee' && role !== 'admin') {
        socket.emit('error:permission', 'Only referee can update score');
        return;
      }

      const match = matchManager.updateScore(matchId, data.team, data.delta);
      if (match) {
        io.to(matchId).emit('match:state', getSafeMatch(match, role));
      } else {
        socket.emit('error:action_failed', 'Match not found or finished');
      }
    },
  );

  // Handle point (rally winner - referee preferred input)
  socket.on('point', (data: { winner: 'home' | 'away'; value?: number }) => {
    if (role !== 'referee' && role !== 'admin') {
      socket.emit('error:permission', 'Only referee can award points');
      return;
    }

    const match = matchManager.awardPoint(matchId, data.winner, data.value);
    if (match) {
      io.to(matchId).emit('match:state', getSafeMatch(match, role));
    } else {
      socket.emit('error:action_failed', 'Match not found or finished');
    }
  });

  socket.on('challenge:use', (data: { team: 'home' | 'away' }) => {
    if (role !== 'referee' && role !== 'admin') {
      socket.emit('error:permission', 'Only referee can trigger challenge');
      return;
    }

    const match = matchManager.useChallenge(matchId, data.team);
    if (match) {
      io.to(matchId).emit('match:state', getSafeMatch(match, role));
    }
  });

  socket.on('sides:toggle', () => {
    if (role !== 'referee' && role !== 'admin') {
      socket.emit('error:permission', 'Only referee/admin can toggle sides');
      return;
    }

    const match = matchManager.toggleSides(matchId);
    if (match) {
      io.to(matchId).emit('match:state', getSafeMatch(match, role));
    }
  });

  socket.on('match:reset', () => {
    if (role !== 'referee' && role !== 'admin') {
      socket.emit('error:permission', 'Only referee/admin can reset match');
      return;
    }

    const match = matchManager.resetMatch(matchId);
    if (match) {
      io.to(matchId).emit('match:state', getSafeMatch(match, role));
    }
  });

  // Handle undo (referee/admin only)
  socket.on('undo', () => {
    if (role !== 'referee' && role !== 'admin') {
      socket.emit('error:permission', 'Only referee/admin can undo');
      return;
    }

    const match = matchManager.undo(matchId);
    if (match) {
      io.to(matchId).emit('match:state', getSafeMatch(match, role));
    } else {
      socket.emit('error:undo', 'Nothing to undo');
    }
  });

  // Timer controls (referee only)
  socket.on('timer:start', () => {
    if (role !== 'referee' && role !== 'admin') {
      socket.emit('error:permission', 'Only referee can control timer');
      return;
    }

    const match = matchManager.startTimer(matchId);
    if (match) {
      io.to(matchId).emit('match:update', {
        type: 'timer',
        timer: match.timer,
      });
    }
  });

  socket.on('timer:pause', () => {
    if (role !== 'referee' && role !== 'admin') {
      socket.emit('error:permission', 'Only referee can control timer');
      return;
    }

    const match = matchManager.pauseTimer(matchId);
    if (match) {
      io.to(matchId).emit('match:update', {
        type: 'timer',
        timer: match.timer,
      });
    }
  });

  socket.on('timer:reset', () => {
    if (role !== 'referee' && role !== 'admin') {
      socket.emit('error:permission', 'Only referee can control timer');
      return;
    }

    const match = matchManager.resetTimer(matchId);
    if (match) {
      io.to(matchId).emit('match:update', {
        type: 'timer',
        timer: match.timer,
      });
    }
  });

  // Config updates (admin only)
  socket.on('config:update', (config: Partial<MatchState['displayConfig']>) => {
    if (role !== 'admin') {
      socket.emit('error:permission', 'Only admin can update config');
      return;
    }

    const match = matchManager.updateDisplayConfig(matchId, config);
    if (match) {
      io.to(matchId).emit('match:update', {
        type: 'config',
        config: match.displayConfig,
      });
    }
  });

  // Template change (admin only)
  socket.on('template:change', (templateId: string) => {
    if (role !== 'admin') {
      socket.emit('error:permission', 'Only admin can change template');
      return;
    }

    const match = matchManager.changeTemplate(matchId, templateId);
    if (match) {
      io.to(matchId).emit('match:update', {
        type: 'template',
        templateId: match.displayConfig?.templateId,
      });
    }
  });

  // Serve change (admin/referee for manual correction)
  socket.on(
    'serve:change',
    (data: { team: 'home' | 'away'; position?: 'left' | 'right' }) => {
      if (role !== 'referee' && role !== 'admin') {
        socket.emit('error:permission', 'Only referee/admin can change serve');
        return;
      }

      const match = matchManager.changeServe(matchId, data.team, data.position);
      if (match && match.server) {
        io.to(matchId).emit('match:update', {
          type: 'point',
          serve: {
            team: match.server,
            position: match.serviceCourt || 'right',
          },
        });
      }
    },
  );

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[${role}] disconnected from match: ${matchId}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🏆 Scoreboard Socket.io server running on port ${PORT}`);
});
