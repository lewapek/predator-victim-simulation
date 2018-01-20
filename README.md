# Predator vs victim simulation

https://lewapek.github.io/predator-victim-simulation/

Simulation presents 2D map and real-time plots (% coverage of each type of entity).

Each cell contains one of:
  * nothing,
  * food,
  * victim,
  * predator.

Predator and victim are able to move and have energy. Predator eats victim, victim eats food, food appears on empty cell with givem probability. When predator or victim eat, they increase their energy, othrewise their lose the enrgy. If energy becomes <= 0, they die.

The code itself is ugly however you may find simulation interesting. There is possibility to tune many parameters (also visual).

