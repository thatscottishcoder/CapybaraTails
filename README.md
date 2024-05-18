# CapybaraTales

### Disclosure:

-   The code within this repository is credited to the owner, Drew Conley.
    -   https://www.youtube.com/playlist?list=PLcjhmZ8oLT0r9dSiIK6RB_PuBWlG1KSq_
-   The purpose of this code is to redesign this into my very own game, based on the guidance of Drew's tutorial.

### My Credit:

-   Credit belongs to myself for:
    -   Compacting of the code into modules, as opposed to including all JS files within the HTML.
    -   Creating dynamic battle scenes based on the player's current map location.
    -   Modifying code to allow opening cutscene to play only on New Game.
    -   Modifying code to start with no pizzas, and to allow save game with no pizzas.
    -   Modifying code to create a 'Quit' function which saves player progress and returns to Title Screen.

## Schema

```SQL
CREATE TABLE Maps (
    mapId TEXT PRIMARY KEY,
    startingHeroX INTEGER,
    startingHeroY INTEGER,
    startingHeroDirection TEXT
);

CREATE TABLE PlayerState (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mapId TEXT,
    FOREIGN KEY (mapId) REFERENCES Maps (mapId)
);

CREATE TABLE Pizzas (
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

CREATE TABLE Lineup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playerStateId INTEGER,
    pizzaId TEXT,
    position INTEGER,
    FOREIGN KEY (playerStateId) REFERENCES PlayerState (id),
    FOREIGN KEY (pizzaId) REFERENCES Pizzas (id)
);

CREATE TABLE Items (
    instanceId TEXT PRIMARY KEY,
    actionId TEXT,
    playerStateId INTEGER,
    FOREIGN KEY (playerStateId) REFERENCES PlayerState (id)
);

CREATE TABLE StoryFlags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flag TEXT,
    value INTEGER,
    playerStateId INTEGER,
    FOREIGN KEY (playerStateId) REFERENCES PlayerState (id)
);
```

## Inserting Data

```SQL
-- Insert map information
INSERT INTO Maps (mapId, startingHeroX, startingHeroY, startingHeroDirection)
VALUES ('Kitchen', 80, 80, 'down');

-- Insert player state and get the id of the inserted row
INSERT INTO PlayerState (mapId)
VALUES ('Kitchen');
SELECT last_insert_rowid();

-- Assuming the last inserted row id for player state is 1
-- Insert pizzas
INSERT INTO Pizzas (id, pizzaId, hp, maxHp, xp, maxXp, level, status, playerStateId)
VALUES ('p1716034916971592', 's001', 50, 50, 0, 100, 1, NULL, 1);

-- Insert lineup
INSERT INTO Lineup (playerStateId, pizzaId, position)
VALUES (1, 'p1', 1),
       (1, 'p1716034916971592', 2);

-- Insert items
INSERT INTO Items (instanceId, actionId, playerStateId)
VALUES ('item1', 'item_recoverHp', 1),
       ('item2', 'item_recoverHp', 1),
       ('item3', 'item_recoverHp', 1);

-- Insert story flags
INSERT INTO StoryFlags (flag, value, playerStateId)
VALUES ('TALKED_TO_CHEF_ISABELLA_1', 1, 1),
       ('USED_PIZZA_STONE', 1, 1);
```
