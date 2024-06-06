using System.Data.SQLite;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(policyBuilder => policyBuilder.AddDefaultPolicy(policy => policy.WithOrigins("*").AllowAnyHeader().AllowAnyHeader()) );

var app = builder.Build();
app.UseHttpsRedirection();
app.UseCors(); 

// var playerData = new List<PlayerState>();

// app.MapPost("/api/create/playerdata", (PlayerState player) => {
//     playerData.Add(player);
//     Console.WriteLine(player);
// });

app.MapGet("/api/weather", async (HttpContext context) => {
    var query = context.Request.Query;
    var lat = query["lat"];
    var lon = query["lon"];

    if(string.IsNullOrEmpty(lat) || string.IsNullOrEmpty(lon))
    {
        context.Response.StatusCode = 400; // Bad Request
        await context.Response.WriteAsync("Latitude and Longitude are required.");
        return;
    }

    var apiKey = "376946fa33662635abb0cdd950c7b737";
    var url = $"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={apiKey}";

    using var httpClient = new HttpClient();
    var response = await httpClient.GetAsync(url);

    if(!response.IsSuccessStatusCode)
    {
        context.Response.StatusCode = (int)response.StatusCode;
        await context.Response.WriteAsync("Failed to fetch weather data.");
        return;
    }

    var weatherData = await response.Content.ReadAsStringAsync();
    var weatherJson = JsonDocument.Parse(weatherData).RootElement;

    var temp = weatherJson.GetProperty("main").GetProperty("temp").GetDouble();
    var weatherCondition = weatherJson.GetProperty("weather")[0].GetProperty("description").GetString();

    var result = new { temp, conditon = weatherCondition };
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(JsonSerializer.Serialize(result));
});

app.MapGet("/api/retrieveData", async context =>
{
    // Open SQLite connection
    string dataSourceName = "Data Source=eg.db;Version=3";
    using var con = new SQLiteConnection(dataSourceName);
    con.Open();

    // Define the example dataset
    var playerStateData = new List<PlayerState>
    {
        new PlayerState(1, "DiningRoom", 80, 80, "down")
    };

    var pizzaData = new List<Pizza>
    {
        new Pizza("p1716034916971592", "s001", 50, 50, 0, 100, 1, null, 1),
        new Pizza("p1", "v001", 50, 50, 0, 100, 1, null, 1)
    };

    var lineupData = new List<Lineup>
    {
        new Lineup(1, "p1716034916971592", 1),
        new Lineup(1, "p1", 2)
    };

    var itemData = new List<Item>
    {
        new Item("item1", "item_recoverHp", 1),
        new Item("item2", "item_recoverHp", 1),
        new Item("item3", "item_recoverHp", 1)
    };

    var storyFlagData = new List<StoryFlag>
    {
        new StoryFlag(1, "TALKED_TO_CHEF_ISABELLA_1", 1, 1),
        new StoryFlag(2, "USED_PIZZA_STONE", 1, 1)
    };

    // Create tables
    string sqlCreateTables = @"
        CREATE TABLE IF NOT EXISTS PlayerState (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            MapId TEXT,
            StartingHeroX INTEGER,
            StartingHeroY INTEGER,
            StartingHeroDirection TEXT
        );

        CREATE TABLE IF NOT EXISTS Pizzas (
            Id TEXT PRIMARY KEY,
            PizzaId TEXT,
            Hp INTEGER,
            MaxHp INTEGER,
            Xp INTEGER,
            MaxXp INTEGER,
            Level INTEGER,
            Status TEXT,
            PlayerStateId INTEGER,
            FOREIGN KEY (PlayerStateId) REFERENCES PlayerState (Id)
        );

        CREATE TABLE IF NOT EXISTS Lineup (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            PlayerStateId INTEGER,
            PizzaId TEXT,
            Position INTEGER,
            FOREIGN KEY (PlayerStateId) REFERENCES PlayerState (Id),
            FOREIGN KEY (PizzaId) REFERENCES Pizzas (Id)
        );

        CREATE TABLE IF NOT EXISTS Items (
            InstanceId TEXT PRIMARY KEY,
            ActionId TEXT,
            PlayerStateId INTEGER,
            FOREIGN KEY (PlayerStateId) REFERENCES PlayerState (Id)
        );

        CREATE TABLE IF NOT EXISTS StoryFlags (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Flag TEXT,
            Value INTEGER,
            PlayerStateId INTEGER,
            FOREIGN KEY (PlayerStateId) REFERENCES PlayerState (Id)
        );
    ";

    using var cmdCreateTables = new SQLiteCommand(sqlCreateTables, con);
    cmdCreateTables.ExecuteNonQuery();

    // Select data from all the tables and combine into a single structure
    var combinedData = new
    {
        playerStates = playerStateData,
        pizzas = pizzaData,
        lineups = lineupData,
        items = itemData,
        storyFlags = storyFlagData
    };

    // Serialize the combined data
    var options = new JsonSerializerOptions
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
    string jsonData = JsonSerializer.Serialize(combinedData, options);

    // Close the connection
    con.Close();

    // Return the combined data
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(jsonData);
});

app.Run();

record PlayerState(int Id, string MapId, int StartingHeroX, int StartingHeroY, string StartingHeroDirection);
record Pizza(string Id, string PizzaId, int Hp, int MaxHp, int Xp, int MaxXp, int Level, string? Status, int PlayerStateId);
record Lineup(int PlayerStateId, string PizzaId, int Position);
record Item(string InstanceId, string ActionId, int PlayerStateId);
record StoryFlag(int Id, string Flag, int Value, int PlayerStateId);