using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
var db = Path.Combine(app.Environment.ContentRootPath, "trid.db");
var cs = $"Data Source={db}";

await using (var c = new SqliteConnection(cs))
{
    await c.OpenAsync();
    var q = c.CreateCommand();
    q.CommandText = """
    CREATE TABLE IF NOT EXISTS sessions(
      id TEXT PRIMARY KEY,
      mode TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS events(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    """;
    await q.ExecuteNonQueryAsync();
}

app.MapGet("/api/health", () => Results.Ok(new { status = "online", service = "TriD.Command" }));

app.MapPost("/api/sessions", async (Start x) =>
{
    var id = Guid.NewGuid().ToString("N");
    await using var c = new SqliteConnection(cs);
    await c.OpenAsync();
    var q = c.CreateCommand();
    q.CommandText = "INSERT INTO sessions VALUES($i,$m,$t,NULL)";
    q.Parameters.AddWithValue("$i", id);
    q.Parameters.AddWithValue("$m", x.Mode);
    q.Parameters.AddWithValue("$t", DateTimeOffset.UtcNow.ToString("O"));
    await q.ExecuteNonQueryAsync();
    return Results.Created($"/api/sessions/{id}", new { id });
});

app.MapPost("/api/sessions/{id}/events", async (string id, GameEvent x) =>
{
    await using var c = new SqliteConnection(cs);
    await c.OpenAsync();
    var q = c.CreateCommand();
    q.CommandText = "INSERT INTO events(session_id,event_type,payload,created_at) VALUES($i,$e,$p,$t)";
    q.Parameters.AddWithValue("$i", id);
    q.Parameters.AddWithValue("$e", x.EventType);
    q.Parameters.AddWithValue("$p", x.Payload);
    q.Parameters.AddWithValue("$t", DateTimeOffset.UtcNow.ToString("O"));
    await q.ExecuteNonQueryAsync();
    return Results.Ok(new { saved = true });
});

app.Run();

record Start(string Mode);
record GameEvent(string EventType, string Payload);
