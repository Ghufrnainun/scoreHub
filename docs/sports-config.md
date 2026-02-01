# Sports Toggle Config

Edit `config/sports.json` to enable or disable sports in the UI and server.

## Example

```json
{
  "sports": [
    { "id": "badminton", "name": "Badminton", "enabled": true },
    { "id": "basketball", "name": "Basketball", "enabled": false },
    { "id": "volleyball", "name": "Volleyball", "enabled": false },
    { "id": "tennis", "name": "Tennis", "enabled": false },
    { "id": "futsal", "name": "Futsal", "enabled": false },
    { "id": "soccer", "name": "Soccer", "enabled": false }
  ]
}
```

## Notes

- The server will **fallback to badminton** if a disabled sport is requested.
- Toggle changes require a server restart to take effect.
- The create match UI reads the same config to show/hide sport tiles.