# Backend logic

- Each time a schedule, e.g. a commute plan, is added to the database, the grouping for schedules on the same day/the same means of transportation should be run.
  - We can optimize computation, by only regrouping based on method of transportation and time of day as well as 'toOffice'.
- It can be possible that a scheduleGroup is containing only 1 schedule, e.g. the user would drive alone. Then we should send a cloud message one hour before the start to notify the user that he/she is driving alone.
  - can be done with firebase cloud functions.
- In my opinion, grouping is most difficult for public transport and driving because of either non-existing navigation apis or the need to introduce the fact that a driver could have a car.
  - easier is cycling. As everybody is rather mobile and that on their own.
    - focus on this first?

## Database structure

```
users:
    uuid
    name
    email
    preferredTransportation
    officeLocation
    createdAt
    normalArrivalTime
schedules:
    uuid
    user_uuid
    start
    end
    methodOfTransportation
    toOffice
    time
    createdAt
    scheduledArrivalTime
```

## Pseudocode for grouping

```
// gets called once a new schedule gets added
schedules = get all schedules from database where (
    time is within 1 hour of the new schedule's time
    and methodOfTransportation is the same as the new schedule's
    and toOffice is the same as the new schedule's toOffice
    and if toOffice is true, end is the same as the new scheule's
)
// Assume that mode is cycling.
if schedules.length > 1
    k = (schedules.length/25).floor() // maximum 25 points for mapbox's matrix api
    clusters[] = k-means(k, schedules); // if no js lib can do, make cloud function with python
    for cluster in clusters:
        matrix = get matrix from mapbox api
        groups = group schedules reachable in under 5 min.
        for group in groups:
            calculate cluster coherence.
            if coherence is high enough:
                // maybe this can be a subroutine to allow for dropping stops.
                calc optimized navigation with all points in group with mapbox optimization
                for all schedules in group:
                    check if detour is less than 10 min.
                    if detour is not less than 10 min:
                        try to remove points and calc optimized navigation again.
                        break
                save group to database
```

## Pseudocode using clique.

**Idea:**
We can create a graph representation of all qualifying (see the definition of the `where` clause from other pseudocode) schedules.
The graph would link nodes where the schedules' starting points are reachable in under 5 min.
Then we can use the clique algorithm to find all cliques in the graph.
We would have to define the clique size, prior, thoughm to make the algorithm get adequate cliques. (e.g. 6 for cycling, 5 for driving, 4 for public transport)

```
cliqueSize = 3
schedules = get all schedules from database where (
    time is within 1 hour of the new schedule's time
    and methodOfTransportation is the same as the new schedule's
    and toOffice is the same as the new schedule's toOffice
    and if toOffice is true, end is the same as the new scheule's
)
graph = createGraphFromSchedules(schedules)
cliques = findCliques(graph, cliqueSize)
for clique in cliques:
    for schedule in clique:
        check if detour is less than 10 min.
        if detour is not less than 10 min:
            try to remove points and calc optimized navigation again.
            break
    save clique to database
    optimizedRoute = mapbox(optimized, clique \union endPoint)
    for schedule in clique:
        navigation = createNavigation(optimizedRoute, schedule)
        saveNavigationToUserDatabase(schedule.user, navigation)

function createGraphFromSchedules(schedules, dist-mode:="degree"):
    // dist-mode can be "degree" or "time"
    graph = {}
    for schedule in schedules:
        graph[schedule.uuid] = []
        for otherSchedule in schedules:
            if schedule.uuid != otherSchedule.uuid:
                if dist-mode == "degree":
                    // distance is calculated with haversine formula
                    // 0.0001 is about 11m
                    if distance(schedule.start, otherSchedule.start) < 0.005:
                        graph[schedule.uuid].push(otherSchedule.uuid)
                else:
                    nav_dist = mapbox(navigate, schedule.start, otherSchedule.start)
                    if nav_dist < 5 min:
                        graph[schedule.uuid].push(otherSchedule.uuid)
    return graph

function findCliques(graph, cliqueSize):
    cliques = []
    for node in graph:
        cliques.push(findCliquesFromNode(graph, node, cliqueSize))
    return cliques

function findCliquesFromNode(graph, node, cliqueSize):
    cliques = []
    for neighbor in graph[node]:
        clique = [node, neighbor]
        for neighbor2 in graph[neighbor]:
            if neighbor2 in graph[node]:
                clique.push(neighbor2)
        if clique.length >= cliqueSize:
            cliques.push(clique)
    return cliques
```

## Pseudocode for notifying

```
// function should be triggered if group is 1 hour before first departure.
// should be triggered by cloud function.
group = get group from database
if schedules.length == 1:
    send notification to user that no group was found.
else:
    for schedule in group:
        send notification to user
```
