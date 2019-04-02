To install unsigned chrome extensions:
1) Extract contents of zip to a new folder.
2) Open Chrome, go to chrome://extensions and hit enter
3) On the top left, click "Load Unpacked"
4) Navigate to the folder with the extension and select this whole folder you extracted to.
5) If first install, make sure you go to a Fleet Move page, as if you were to launch a fleet. You just need to go to this once.
6) Remember to check for https:// or http://. The extension will treat each one as a separate domain, so settings are not carried over between http:// and https://. 

-Rick


Other features:

-- Auto Launch, Shotgun Launching:
Page: Fleet Move Page
Usage: Type in the landing time (or launching time) for a timed launch. It values are in server time. 
Example of time format: 2019-02-22 12:00:00, or 5 Mar 2019, 16:31:30 will work.

Put your time in corresponding box (landing time or launching time)
Fill in how many ships you want to send
Then click "Timed Launch" to set it.

Note you can use "shotgun" fleet mode. This will send [x] amount of identical fleets at the same time, and you can use this either with timed launch mode or immediate launch mode.

Works the same way as timed launch, just fill in how many of each ship you want in the shotgun fleet, then type in a number for how many shotgun fleets you want to send. Then click either immediate launch, or timed launch if you want to launch later.

-- Super Attacking
Page: Fleet Attack Page, also have a floating assistant
Usage: Two choices on how to use. First way requires no setting up. When you go to attack, there are multiple choices instead of just "Attack". There is "Attack", "OneKey" and "Repair". First button works like normal attack.
"OneKey" will allow you to press that and it will attack without moving to a new page. You can quickly press this multiple times to get many fast attacks in.
Repair is to repair all units without changing pages.
For cap ships, you alternate between onekey and repair to quickly attack-repair-attack.

-- Floating 'assistant' window:
Jump Target: Will cover this later in this readme
Attack assistant: Enter YOUR fleet ID you want to attack with. This serves as a shortcut to the attack page for that fleet ID. Good for when you are waiting to land and dont want to F5, or are somewhere else. Just click "Attack" and it takes you there.
Enemy ID List: Enter a list of Player IDs you will be targeting on landing. This will cause those player's fleets to highlight in red. Great for blob crashes when enemies change their names, since this goes off of IDs only. Can have multiple enemy ids listed.

-- Jump System:
Page: Fleet Overview, for any fleet IN FLIGHT currently
Usage: Fill in a destination in the lower box. Type in how many of each ship you want to jump on landing.
Once done, click 'Move' and it will start counting down til landing.
Once fleet lands, it will move the ships you specified to the new location you also specified automatically.

Note that AE has hardcoded 5 seconds of delay, so it cannot move the ships until 5 seconds has passed. It helps but still dangerous on a hot landing.
Good for FT dropping, or just bouncing fleet around if you won't be awake for landing or for a recall.

-- Fleet Analyzer (Spec Finder):
Page: Location, with fleets listed
Usage: Click the top left button and just wait. More fleets there are longer it takes. About .5-1.0 seconds per fleet.
Press F12 if you want to see it working. It will check each fleet at that location. It will add up value of each of the ships inside each fleet, and find the maximum amount. If that amount is greater than 100,000 and it is also the highest value of all ships there, it will tag that player as that spec.
Every time after that, those fleets shown will be prefaced with the players spec (IF, FR, Caps, DN, HC, etc)
FT specs are tagged as "(Drop)"

-- Auto Builder:
Pages: Events Page, also on each base Structures page
Usage on EVENTS page: 
Next to button 'auto' is a textbox. This is the maximum level of any structure. It won't build past this level. Type in max you want, then click auto and it will start autobuilding all bases. This will build spaceports, econ centers, shipyards, metal refiniers, robotic factories, nanites, androids, and orbital shipyards. It will build the best possible energy, pop, and area buildings as well in between. Logic is not perfect yet, best to use early on in base development and manually build later.

Useage on BASE page:
Two choices here, you can click auto and it will autobuild with the same logic, but for only this base. Other choice is to fill in some numbers near the structures and click 'All' or "This"
This will build the structures to the specified level. It will build energy/pop/area structures as needed.
Note that this mode will build each structure up to the level you specify, at once. So if you have 25 MR / 20 RF selected and you have level 1 MR / 0 RF, it will attempt to build 25 MR before going to the next structure.
This mode is usually best for JG builders, so you can specify level 10 JG, hit "All" and just let it build whatever it needs to in between to get to level 10 jgs.