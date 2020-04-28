# Pokemon AI

Use the Pokemon Showdown Engine to build an AI capable of battling and building teams in the VGC 2020 format.

## Structure

Each AI is an agent composed of the following:

- Pokemon Team
- Matchup Strategy
- Battle Strategy
- Information Model

## Pokemon Team
The description needed to instance a Pokemon Team.

## Matchup Strategy
Uses the Pokemon Team, the Information Model and the opponent's Preview to generate a viable matchup against the opponent.

## Battle Strategy
Uses all elements in play to build a set of actions for each agent.

## Information Model
Responds to the events that occur during the game to build a probabilistic model of what the opponent's team composition is.
FIXME: This part's development is missing, but is crucial for smarter AI.
