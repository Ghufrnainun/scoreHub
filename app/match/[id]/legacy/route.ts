export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

const resolveParams = async (params: RouteContext['params']) =>
  Promise.resolve(params);

const esc = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderLegacyPage = (matchId: string) => {
  const safeMatchId = esc(matchId);
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ScoreHub Legacy Scoreboard - ${safeMatchId}</title>
  <style>
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: #000000;
      color: #ffffff;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      user-select: none;
    }
    
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    /* Top universal header bar */
    .top-bar {
      height: 56px;
      background-color: rgba(0, 0, 0, 0.5);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      padding: 0 32px;
      z-index: 10;
    }
    .brand-box {
      display: flex;
      align-items: center;
    }
    .brand-logo-container {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }
    .brand-logo {
      height: 32px;
      width: 32px;
      object-fit: contain;
    }
    .brand-name {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: rgba(255, 255, 255, 0.5);
      font-family: inherit;
    }

    /* Main contents area */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 20px;
      position: relative;
    }

    .scoreboard-wrapper {
      width: 95%;
      max-width: 1600px;
      display: flex;
      flex-direction: column;
    }

    /* Labels alignment header row */
    .labels-container {
      width: 100%;
      display: flex;
      margin-bottom: 8px;
      padding: 0 8px;
    }
    .labels-spacer {
      flex: 1;
    }
    .labels-scores {
      display: flex;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 14px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .lbl-col-set {
      width: 160px;
      text-align: center;
      color: #64748b; /* text-gray-500 */
    }
    .lbl-col-score {
      width: 256px;
      text-align: center;
      color: #fbbf24; /* text-[#fbbf24] */
    }

    /* Scoreboard Box with table for 100% stable grids on old smartTVs */
    .scoreboard-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      background-color: #000000;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
      table-layout: fixed;
    }

    /* Rows & Cells */
    .team-info-cell {
      background-color: #111111;
      padding: 0 32px;
      vertical-align: middle;
    }
    .flex-row {
      display: flex;
      align-items: center;
      width: 100%;
    }

    /* Team Mark - colored flag box */
    .team-mark {
      width: 64px;
      height: 40px;
      border-radius: 2px;
      border: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-right: 16px;
      background-image: linear-gradient(to bottom right, rgba(255,255,255,0.05), rgba(0,0,0,0.2));
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    /* Team Code Text (beside flag box) */
    .team-code {
      font-weight: bold;
      font-size: 30px;
      color: #ffffff;
      letter-spacing: 0.1em;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin-right: 24px;
    }

    /* Player Name container */
    .player-name {
      font-weight: 900;
      font-size: 40px;
      text-transform: uppercase;
      letter-spacing: -1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .serving-text {
      color: #ffffff !important;
    }
    .idle-text {
      color: #9ca3af !important; /* text-gray-400 */
    }

    /* Beregu/Team mode small wins count */
    .team-match-badge {
      display: inline-flex;
      align-items: center;
      background-color: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(52, 211, 153, 0.3);
      color: #6ee7b7;
      font-weight: 900;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 20px;
      margin-right: 16px;
      vertical-align: middle;
      letter-spacing: 1px;
    }

    /* Past Set Score Cells */
    .past-set-cell {
      width: 160px;
      background-color: #0a0a0a;
      font-size: 48px;
      font-weight: bold;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #fbbf24;
      opacity: 0.8;
      text-align: center;
      vertical-align: middle;
    }

    /* Main Score Cell */
    .score-cell {
      width: 256px;
      background-color: #000000;
      border-left: 4px solid #334155; /* border-slate-700 */
      font-size: 96px;
      font-weight: 900;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #4ade80; /* Green text */
      text-align: center;
      vertical-align: middle;
      letter-spacing: -2px;
    }

    /* Footer */
    .footer-bar {
      height: 40px;
      background-color: rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      padding: 0 32px;
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: rgba(255, 255, 255, 0.2);
      text-transform: uppercase;
      letter-spacing: 0.3em;
    }
    .footer-info-row {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .footer-bold {
      color: rgba(255, 255, 255, 0.4);
      font-weight: bold;
    }
    .footer-divider {
      width: 1px;
      height: 12px;
      background-color: rgba(255, 255, 255, 0.1);
    }

    /* Animations */
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .serve-icon-svg {
      margin-left: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 10px #fbbf24);
    }

    .conn-error {
      margin-left: auto;
      color: #ef4444;
      letter-spacing: 0.1em;
      font-weight: bold;
    }
    .fs-toggle {
      position: fixed;
      bottom: 12px;
      right: 12px;
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.15;
      transition: all 0.3s ease;
      z-index: 9999;
      color: #ffffff;
      padding: 0;
      outline: none;
    }
    .fs-toggle:hover {
      opacity: 0.9;
      background: rgba(30, 41, 59, 0.85);
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="app-container">
    
    <!-- Header Bar -->
    <div class="top-bar">
      <div class="brand-box">
        <div class="brand-logo-container">
          <img src="/logo-pb.png" alt="PB Logo" class="brand-logo" onerror="this.style.display='none';" />
        </div>
        <span class="brand-name">ScoreHub</span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      
      <!-- Outer Scoreboard Layout -->
      <div class="scoreboard-wrapper">
        
        <!-- Label Header Row -->
        <div class="labels-container" id="labelsRowContainer">
          <div class="labels-spacer"></div>
          <div class="labels-scores" id="labelsRowValues">
            <!-- Dynamically inserted Set Labels -->
          </div>
        </div>

        <!-- Primary Scoreboard Component -->
        <table class="scoreboard-table">
          <tbody id="tbodyScoreboard">
            <!-- Dynamically inserted Score Rows -->
            <tr style="height: 160px;">
              <td style="background-color: #111; text-align: center; font-size: 24px; color: #64748b; font-weight: bold;">
                MENGINISIALISASI SCOREBOARD...
              </td>
            </tr>
          </tbody>
        </table>

      </div>

    </div>

    <!-- Footer Bar -->
    <div class="footer-bar">
      <div class="footer-info-row">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="footer-bold" id="footerCatCode">MS</span>
          <span id="footerCatName">TUNGGAL PUTRA</span>
        </div>
        <div class="footer-divider"></div>
        <span id="footerCourtName">LAPANGAN 1</span>
      </div>
      <span class="conn-error" id="errorStatusEl"></span>
    </div>

  </div>

  <!-- Floating Fullscreen Button (must exist before script runs) -->
  <button id="fsBtn" class="fs-toggle" title="Toggle Fullscreen">
    <svg style="width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    </svg>
  </button>

  <!-- High-compatibility JavaScript -->
  <script>
    (function () {
      var matchId = ${JSON.stringify(matchId)};
      var endpoint = '/api/legacy/match/' + encodeURIComponent(matchId);
      var timer = null;
      var pending = false;

      var CATEGORY_MAP = {
        'MS': 'Tunggal Putra',
        'WS': 'Tunggal Putri',
        'MD': 'Ganda Putra',
        'WD': 'Ganda Putri',
        'XD': 'Ganda Campuran',
        '': 'Tunggal Putra'
      };

      function setText(id, text) {
        var node = document.getElementById(id);
        if (!node) return;
        node.innerHTML = '';
        node.appendChild(document.createTextNode(text));
      }

      function getPlayersName(team, defaultVal) {
        if (team.players && team.players.length > 0) {
          var names = [];
          for (var i = 0; i < team.players.length; i++) {
            if (team.players[i] && team.players[i].name) {
              names.push(team.players[i].name.toUpperCase());
            }
          }
          if (names.length > 0) {
            return names.join(' / ');
          }
        }
        return (team.name || defaultVal).toUpperCase();
      }

      function getCountry(team) {
        if (team.country) return team.country.toUpperCase();
        if (team.players && team.players.length > 0) {
          var country = team.players[0].country;
          if (country) return country.toUpperCase();
        }
        return '';
      }

      function applyData(data) {
        var home = data.teams.home;
        var away = data.teams.away;
        var sets = data.sets || [];
        var currentSet = data.currentSet || 1;
        var status = (data.status || '').toLowerCase();
        var server = data.server;
        var isFlipped = Boolean(data.isFlipped);

        var isSingles = (data.category === 'MS' || data.category === 'WS');
        var isTeamMatch = !isSingles && (
          (home.players && home.players.length > 2) ||
          (away.players && away.players.length > 2)
        );

        var showSetWinsAtRight = (status === 'finished' && !isTeamMatch);

        var showSet1 = (currentSet > 1 || status === 'finished');
        var showSet2 = (currentSet > 2 || status === 'finished');
        var showSet3 = (status === 'finished' && sets.length >= 3);

        // 1. Render Top Labels Bar
        var labelsHtml = '';
        if (showSet1) labelsHtml += '<div class="lbl-col-set">Set 1</div>';
        if (showSet2) labelsHtml += '<div class="lbl-col-set">Set 2</div>';
        if (showSet3) labelsHtml += '<div class="lbl-col-set">Set 3</div>';
        labelsHtml += '<div class="lbl-col-score">' + (showSetWinsAtRight ? 'Set Menang' : 'Poin') + '</div>';
        
        var labelsEl = document.getElementById('labelsRowValues');
        if (labelsEl) labelsEl.innerHTML = labelsHtml;

        // 2. Row Builder Helper
        function renderRow(team, isHome, isLastRow) {
          var isServing = (server === (isHome ? 'home' : 'away'));
          var teamColor = (isHome ? '#3b82f6' : '#ef4444'); // Home: Blue, Away: Red

          // Extract country code for the flag box
          var rawCountry = getCountry(team);
          var code = rawCountry ? rawCountry.substring(0, 3) : team.name.substring(0, 3);
          code = code.toUpperCase();

          var playerNames = getPlayersName(team, isHome ? 'HOME' : 'AWAY');
          var borderStyle = isLastRow ? '' : 'border-bottom: 1px solid #1e293b;';

          var html = '<tr style="height: 160px; ' + borderStyle + '">';

          // Serving side accent strip
          var accentColor = isServing ? teamColor : 'transparent';
          html += '<td style="width: 12px; background-color: ' + accentColor + ';" class="' + (isServing ? 'pulse' : '') + '"></td>';

          // Team Metadata Details Block
          html += '<td class="team-info-cell">';
          html += '  <div class="flex-row">';
          
          // Colored team box
          html += '    <div class="team-mark" style="background-color: ' + teamColor + ';">' + code + '</div>';
          
          // Mono text code
          html += '    <div class="team-code">' + code + '</div>';
          
          // Names & Team Score Badge
          var activeClass = isServing ? 'serving-text' : 'idle-text';
          html += '    <div class="player-name ' + activeClass + '">';
          if (isTeamMatch) {
            html += '<span class="team-match-badge">' + (team.setsWon || 0) + '</span>';
          }
          html += playerNames;
          html += '    </div>';

          // Shuttlecock Serving Indicator
          if (isServing) {
            html += '  <div class="serve-icon-svg pulse">';
            html += '    <svg style="width: 36px; height: 36px; fill: #fbbf24; vertical-align: middle;" viewBox="0 -0.42 42.356 42.356">';
            html += '      <path d="M157.288,169.268l2.295,5.865s-8.735,11.6-9.88,13.583-4.124,3.328-4.124,3.328l-1.666,3.2,2.738,2.738,1.709-1.709a49.942,49.942,0,0,1,2.636-5.656c1.212-2.013,9.826-13.669,9.826-13.669L167.7,178.3l1.354,6.882s-11.6,8.556-13.669,9.826a46.424,46.424,0,0,1-5.656,2.636l-1.709,1.709,2.693,2.693,3.363-1.745s1.327-2.963,3.3-4.1,13.5-9.8,13.5-9.8l5.852,2.307-1.6,5.511s-13.267,5.661-15.275,6.735a48.208,48.208,0,0,1-5.477,1.733l-6.765,3.887.711.711-2.45,2.45-.092-.092a6.523,6.523,0,0,1-8.253-.714l-1.83-1.83c-2.214-2.214-1.388-4.625.6-6.938l-.034-.034.942-.942h0l1.508-1.508.665.665,3.8-6.589a21.029,21.029,0,0,1,1.759-5.5c1.146-1.986,6.814-15.355,6.814-15.355l5.536-1.63M142.993,197l-1.7,3.259,2.223,2.223-.686-.686,2.479-2.479Zm3.689,3.689L144.2,203.17l1.483,1.483,3.265-1.694Z" transform="translate(-134.376 -169.268)"></path>';
            html += '    </svg>';
            html += '  </div>';
          }
          
          html += '  </div>';
          html += '</td>';

          // Past Set Values Columns
          if (showSet1) {
            var s1Val = sets[0] ? (isHome ? sets[0].home : sets[0].away) : (currentSet === 1 ? team.score : '0');
            html += '<td class="past-set-cell">' + s1Val + '</td>';
          }
          if (showSet2) {
            var s2Val = sets[1] ? (isHome ? sets[1].home : sets[1].away) : (currentSet === 2 ? team.score : '0');
            html += '<td class="past-set-cell">' + s2Val + '</td>';
          }
          if (showSet3) {
            var s3Val = sets[2] ? (isHome ? sets[2].home : sets[2].away) : (currentSet === 3 ? team.score : '0');
            html += '<td class="past-set-cell">' + s3Val + '</td>';
          }

          // Primary Score Column
          var displayVal = showSetWinsAtRight ? (team.setsWon || 0) : (team.score || 0);
          html += '<td class="score-cell">' + displayVal + '</td>';

          html += '</tr>';
          return html;
        }

        // 3. Render main table body (Home is always on top, no flipping requested)
        var gridRows = '';
        gridRows += renderRow(home, true, false);
        gridRows += renderRow(away, false, true);
        
        var tbodyEl = document.getElementById('tbodyScoreboard');
        if (tbodyEl) tbodyEl.innerHTML = gridRows;

        // 4. Update footer metadata
        var catCode = data.category || 'MS';
        var catName = CATEGORY_MAP[catCode] || catCode;
        
        setText('footerCatCode', catCode);
        setText('footerCatName', catName.toUpperCase());
        
        var conf = data.displayConfig || {};
        var court = conf.courtName || 'LAPANGAN 1';
        setText('footerCourtName', court.toUpperCase());
        
        setText('errorStatusEl', '');
      }

      function setError(msg) {
        setText('errorStatusEl', '[!' + msg + ']');
      }

      function fetchMatch() {
        if (pending) return;
        pending = true;
        var xhr = new XMLHttpRequest();
        var url = endpoint + '?_=' + new Date().getTime();
        
        xhr.open('GET', url, true);
        xhr.timeout = 3000;
        xhr.onreadystatechange = function () {
          if (xhr.readyState !== 4) return;
          pending = false;
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              var json = JSON.parse(xhr.responseText);
              if (json && json.ok) {
                applyData(json);
                return;
              }
              setError('Data err');
            } catch(e) {
              setError('Parse err');
            }
            return;
          }
          setError('HTTP ' + xhr.status);
        };
        xhr.ontimeout = function() { pending = false; setError('Timeout'); };
        xhr.onerror = function() { pending = false; setError('Conn lost'); };
        xhr.send();
      }

      // Cross-browser Fullscreen API toggle supporting Smart TVs (WebKit/Tizen/WebOS)
      var fsBtn = document.getElementById('fsBtn');
      if (fsBtn) {
        fsBtn.onclick = function() {
          var doc = window.document;
          var docEl = doc.documentElement;
          var req = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
          var exit = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
          var isFs = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;

          try {
            if (!isFs) {
              if (req) req.call(docEl);
            } else {
              if (exit) exit.call(doc);
            }
          } catch(e) {
            console.error('Fullscreen failed', e);
          }
        };
      }

      fetchMatch();
      timer = setInterval(fetchMatch, 1200);

      window.onbeforeunload = function () {
        if (timer) clearInterval(timer);
      };
    })();
  </script>
</body>
</html>`;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await resolveParams(context.params);
  const safeId = typeof id === 'string' && id.trim() ? id.trim() : '';

  if (!safeId) {
    return new Response('Invalid match id', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(renderLegacyPage(safeId), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
