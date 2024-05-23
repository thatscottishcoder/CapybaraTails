using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.Text.Json;

class Program
{
    static void Main()
    {
        // Step 1: Define the example dataset
        var mapDataset = new List<Map> {
            new Map("Kitchen", 80, 80, "down")
        };

        var playerStateDataset = new List<PlayerState> {
            new PlayerState(1, "Kitchen")
        };

        var pizzaDataset = new List<Pizza> {
            new Pizza("p1716034916971592", "s001", 50, 50, 0, 100, 1, null, 1)
        };

        var lineupDataset = new List<Lineup> {
            new Lineup(1, "p1", 1),
            new Lineup(1, "p1716034916971592", 2)
        };

        var itemDataset = new List<Item> {
            new Item("item1", "item_recoverHp", 1),
            new Item("item2", "item_recoverHp", 1),
            new Item("item3", "item_recoverHp", 1)
        };

        var storyFlagDataset = new List<StoryFlag> {
            new StoryFlag(1, "TALKED_TO_CHEF_ISABELLA_1", 1, 1),
            new StoryFlag(2, "USED_PIZZA_STONE", 1, 1)
        };

        // Step 2: Open SQLite connection
        string dataSourceName = "Data Source=eg.db;Version=3";
        using var con = new SQLiteConnection(dataSourceName);
        con.Open();

        // Step 3: Create tables
        string sqlCreateTables = @"
            CREATE TABLE IF NOT EXISTS Maps (
                mapId TEXT PRIMARY KEY,
                startingHeroX INTEGER,
                startingHeroY INTEGER,
                startingHeroDirection TEXT
            );

            CREATE TABLE IF NOT EXISTS PlayerState (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mapId TEXT,
                FOREIGN KEY (mapId) REFERENCES Maps (mapId)
            );

            CREATE TABLE IF NOT EXISTS Pizzas (
                id TEXT PRIMARY KEY,
                pizzaId TEXT,
                hp INTEGER,
                maxHp INTEGER,
                xp INTEGER,
                maxXp INTEGER,
                level INTEGER,
                status TEXT,
                playerStateId INTEGER,
                FOREIGN KEY (playerStateId) REFERENCES PlayerState (id)
            );

            CREATE TABLE IF NOT EXISTS Lineup (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                playerStateId INTEGER,
                pizzaId TEXT,
                position INTEGER,
                FOREIGN KEY (playerStateId) REFERENCES PlayerState (id),
                FOREIGN KEY (pizzaId) REFERENCES Pizzas (id)
            );

            CREATE TABLE IF NOT EXISTS Items (
                instanceId TEXT PRIMARY KEY,
                actionId TEXT,
                playerStateId INTEGER,
                FOREIGN KEY (playerStateId) REFERENCES PlayerState (id)
            );

            CREATE TABLE IF NOT EXISTS StoryFlags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                flag TEXT,
                value INTEGER,
                playerStateId INTEGER,
                FOREIGN KEY (playerStateId) REFERENCES PlayerState (id)
            );
        ";

        using var cmdCreateTables = new SQLiteCommand(sqlCreateTables, con);
        cmdCreateTables.ExecuteNonQuery();

        // Step 4: Insert data into the tables
        foreach (var map in mapDataset)
        {
            string sqlCheckMap = "SELECT COUNT(*) FROM Maps WHERE mapId = @mapId";
            using var cmdCheckMap = new SQLiteCommand(sqlCheckMap, con);
            cmdCheckMap.Parameters.AddWithValue("@mapId", map.MapId);
            long mapExists = (long)cmdCheckMap.ExecuteScalar();

            if (mapExists == 0)
            {
                string sqlInsertMap = "INSERT INTO Maps (mapId, startingHeroX, startingHeroY, startingHeroDirection) VALUES (@mapId, @startingHeroX, @startingHeroY, @startingHeroDirection)";
                using var cmdInsertMap = new SQLiteCommand(sqlInsertMap, con);
                cmdInsertMap.Parameters.AddWithValue("@mapId", map.MapId);
                cmdInsertMap.Parameters.AddWithValue("@startingHeroX", map.StartingHeroX);
                cmdInsertMap.Parameters.AddWithValue("@startingHeroY", map.StartingHeroY);
                cmdInsertMap.Parameters.AddWithValue("@startingHeroDirection", map.StartingHeroDirection);
                cmdInsertMap.ExecuteNonQuery();
            }
        }

        foreach (var playerState in playerStateDataset)
        {
            string sqlInsertPlayerState = "INSERT INTO PlayerState (mapId) VALUES (@mapId)";
            using var cmdInsertPlayerState = new SQLiteCommand(sqlInsertPlayerState, con);
            cmdInsertPlayerState.Parameters.AddWithValue("@mapId", playerState.MapId);
            cmdInsertPlayerState.ExecuteNonQuery();
        }

        foreach (var pizza in pizzaDataset)
        {
            string sqlCheckPizza = "SELECT COUNT(*) FROM Pizzas WHERE id = @id";
            using var cmdCheckPizza = new SQLiteCommand(sqlCheckPizza, con);
            cmdCheckPizza.Parameters.AddWithValue("@id", pizza.Id);
            long pizzaExists = (long)cmdCheckPizza.ExecuteScalar();

            if (pizzaExists == 0)
            {
                string sqlInsertPizza = @"
                    INSERT INTO Pizzas (id, pizzaId, hp, maxHp, xp, maxXp, level, status, playerStateId)
                    VALUES (@id, @pizzaId, @hp, @maxHp, @xp, @maxXp, @level, @status, @playerStateId)";
                using var cmdInsertPizza = new SQLiteCommand(sqlInsertPizza, con);
                cmdInsertPizza.Parameters.AddWithValue("@id", pizza.Id);
                cmdInsertPizza.Parameters.AddWithValue("@pizzaId", pizza.PizzaId);
                cmdInsertPizza.Parameters.AddWithValue("@hp", pizza.Hp);
                cmdInsertPizza.Parameters.AddWithValue("@maxHp", pizza.MaxHp);
                cmdInsertPizza.Parameters.AddWithValue("@xp", pizza.Xp);
                cmdInsertPizza.Parameters.AddWithValue("@maxXp", pizza.MaxXp);
                cmdInsertPizza.Parameters.AddWithValue("@level", pizza.Level);
                cmdInsertPizza.Parameters.AddWithValue("@status", pizza.Status);
                cmdInsertPizza.Parameters.AddWithValue("@playerStateId", pizza.PlayerStateId);
                cmdInsertPizza.ExecuteNonQuery();
            }
        }

        foreach (var lineup in lineupDataset)
        {
            string sqlInsertLineup = "INSERT INTO Lineup (playerStateId, pizzaId, position) VALUES (@playerStateId, @pizzaId, @position)";
            using var cmdInsertLineup = new SQLiteCommand(sqlInsertLineup, con);
            cmdInsertLineup.Parameters.AddWithValue("@playerStateId", lineup.PlayerStateId);
            cmdInsertLineup.Parameters.AddWithValue("@pizzaId", lineup.PizzaId);
            cmdInsertLineup.Parameters.AddWithValue("@position", lineup.Position);
            cmdInsertLineup.ExecuteNonQuery();
        }

        foreach (var item in itemDataset)
        {
            string sqlCheckItem = "SELECT COUNT(*) FROM Items WHERE instanceId = @instanceId";
            using var cmdCheckItem = new SQLiteCommand(sqlCheckItem, con);
            cmdCheckItem.Parameters.AddWithValue("@instanceId", item.InstanceId);
            long itemExists = (long)cmdCheckItem.ExecuteScalar();

            if (itemExists == 0)
            {
                string sqlInsertItem = "INSERT INTO Items (instanceId, actionId, playerStateId) VALUES (@instanceId, @actionId, @playerStateId)";
                using var cmdInsertItem = new SQLiteCommand(sqlInsertItem, con);
                cmdInsertItem.Parameters.AddWithValue("@instanceId", item.InstanceId);
                cmdInsertItem.Parameters.AddWithValue("@actionId", item.ActionId);
                cmdInsertItem.Parameters.AddWithValue("@playerStateId", item.PlayerStateId);
                cmdInsertItem.ExecuteNonQuery();
            }
        }

        foreach (var storyFlag in storyFlagDataset)
        {
            string sqlInsertStoryFlag = "INSERT INTO StoryFlags (flag, value, playerStateId) VALUES (@flag, @value, @playerStateId)";
            using var cmdInsertStoryFlag = new SQLiteCommand(sqlInsertStoryFlag, con);
            cmdInsertStoryFlag.Parameters.AddWithValue("@flag", storyFlag.Flag);
            cmdInsertStoryFlag.Parameters.AddWithValue("@value", storyFlag.Value);
            cmdInsertStoryFlag.Parameters.AddWithValue("@playerStateId", storyFlag.PlayerStateId);
            cmdInsertStoryFlag.ExecuteNonQuery();
        }

        // Step 5: Select data from all the tables and combine into a single structure
        var combinedData = new
        {
            PlayerStates = playerStateDataset,
            Maps = mapDataset,
            Pizzas = pizzaDataset,
            Lineups = lineupDataset,
            Items = itemDataset,
            StoryFlags = storyFlagDataset
        };

        // Step 6: Serialize the combined data and print it
        string jsonData = JsonSerializer.Serialize(combinedData, new JsonSerializerOptions { WriteIndented = true });
        Console.WriteLine(jsonData);
    }

    record Map(string MapId, int StartingHeroX, int StartingHeroY, string StartingHeroDirection);
    record PlayerState(int Id, string MapId);
    record Pizza(string Id, string PizzaId, int Hp, int MaxHp, int Xp, int MaxXp, int Level, string? Status, int PlayerStateId);
    record Lineup(int PlayerStateId, string PizzaId, int Position);
    record Item(string InstanceId, string ActionId, int PlayerStateId);
    record StoryFlag(int Id, string Flag, int Value, int PlayerStateId);
}
