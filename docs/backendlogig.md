# Backend logic

- Each time a schedule, e.g. a commute plan, is added to the database, the grouping for schedules on the same day/the same means of transportation should be run.
  - We can optimize computation, by only regrouping based on method of transportation and time of day as well as 'toOffice'.
- It can be possible that a scheduleGroup is containing only 1 schedule, e.g. the user would drive alone. Then we should send a cloud message one hour before the start to notify the user that he/she is driving alone.
  - can be done with firebase cloud functions.
