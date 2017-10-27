# Webshovel

This is an abandoned start of a voxel multiplayer game engine written completetly in Javascript. The very earliest versions originate to late 2015 (i was 16 back then). It was primarily a learning tool without a real goal. I hoped to one day possibly to make it into a Ace of Spades 0.75 clone (thus the name), so far that hasn't happened. In summer of 2017 I decided to rewrite and redesing this in C++ and release this for public amusement.

There is very little comments and no documentation at all.
Feel free to ask me how things work if someone somewhy decides to do something with this.

You can try it at http://kosshi.fi/experiments/webshovel/client.html

# Features and stuff
- It runs suprisingly well
- World and meshing is managed by a webworker leading to zero stutter on chunk updates
- Very basic multiplayer, terrain is synchronized and other players are visible as wireframe rectangles
- Very smooth Swept AABB based playerphysics. There's is some bugs related to float rounding errors tho.
- Quake-style strafe-jumping mechanics that dont work quite right, but are fun enough
- Server can save the terrain to a disk and read it back (type ``save`` in the server cmd)
- Over-engieneered bandwidth efficient networking
- Placeholder options override in url, eg. ``/client.html?ip=kosshi.fi:8080``. There's a handful of option that will moslty break things, you can find them in the ``src/client/settings.js`` file
- Ugly bitmap text renderer, overlaying HTML (or anything) performs suprisingly badly
- 4tap texturing, idea by ![0fps](https://0fps.net/2013/07/09/texture-atlases-wrapping-and-mip-mapping/)
- A lot of obscure interesting features that nobody needs (like my fancy input configs inspired by the Source engine)

# How to run it
### Server
Should work both on Linux and Windows
- You need to install Node.js and https://github.com/theturtle32/WebSocket-Node
- Then you need to find out what else it's missing and report about it
- Run server.bat or ``node server.js`` in ``src/server/`` and hope it works
### Client
Publish this whole thing on a web server and access it on a browser.
Note: HTTPS Doesn't work. 

# License
MIT
