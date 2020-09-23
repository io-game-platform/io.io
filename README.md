# io.io
Pump and dump io games.

## Repo Usage
The .io game template is in the branch _template_.
Each game is based off of the template branch into their own branch.
Development branches should be named as _gamename_/_featurename_

## Purpose
.io games are simple web based projects where you compete against a large number of bots in a sort of 100 player free for all, single winner type game. For example, agar.io and paper.io.
Only a small percentage of games in this genre have achieved enough success to make their creators rich, thus in order to profit these games need to be pumped out like a factory.


## Solution / Deliverables
We will build a platform to expedite the process of creating and managing .io games in aim that we eventually make one that gets popular.

Library of reusable, pre-built .io functionality
- A bare bones web friendly game template including main loop, keyboard control, mouse control and rendering that can be further fleshed out for each individual game.
- *(Stretch)* Make a mobile friendly template.
- Networking code to start peer to peer lobby, generate unique joinable ID and passcode to play with friends.
- Function to save user data locally(wins, points, …).
- Sending issue / crash information with corresponding computer and browser data to our server so we’ll know when our code doesn’t work on someone else’s machine.
- Any other commonly used functionality that comes up while we develop games.

Services to manage multiple games
- Regularly aggregate individual games playtime / active user analytics and compare their performance to each other in some sort of dashboard.
- Server setup to as automatically as possible deploy and host games on.
- A dominan to branch off subdomains / directories per each game for(ie paper.website.io, agar.website.io).
- Library of visual and audio assets.
- *(Stretch)* Twitter / Discord bot to notify when a new game comes out.

In order to demonstrate the utility of what we make, we will build two games that make use of the platform.

## Timelines
10 week timeline to account for 3 weeks already gone, thanksgiving and a week or two to prepare for final presentation.

### Group 1
**Weeks 1-3**: Design and build .io game without networking and other tools being made by other groups.

**Weeks 4-5**: Abstract out bare bones web friendly game template.

**Week 6**: First game implements networking functionality from group 2 and deploy with work from group 3.

**Weeks 7-10**: Design, build and deploy second .io game fully making use of platform.

(Compiling library of visual and audio assets while developing games.)


### Group 2
**Weeks 1-5**: Networking code to start peer to peer lobby, generate unique joinable ID and passcode to play with friends.
 
**Weeks 6-7**: Function to send issue / crash information + important computer and browser data to server.

**Weeks 8-9**: Ensure all code integrates with both .io games running simultaneously from group 1 and server / domain setup from group 3.

**Week 10**: Function to save user data locally(wins, points, …).


### Group 3
**Weeks 1-2**: Setup server so that we can deploy and host games.

**Weeks 3-4**: Automate / simplify process of deploying games to server.

**Weeks 5-8**: Build dashboard to aggregate and compare game popularity and other metrics.

**Week 9**: Setup domain, give both games a subdomain / directory.

**Week 10**: Help fix likely issues after deploying both games.
