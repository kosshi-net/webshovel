# Webshovel

This is a abandoned start of a voxel multiplayer game engine written 
completetly in Javascript.

This was originally started in late 2015 by 16-year old me. Many bad decicions were made.
There is very little comments and no documentation at all. 
Feel free to ask me how things work if someone somewhy decides to do something with this.

You can try it at http://kosshi.fi/experiments/webshovel/client.html

# Features
It runs suprisingly well
World and meshing is managed by a webworker leading to zero stutter on chunk updates
Very basic multiplayer, terrain is synchronized and other players are visible as wireframe rectangles
Solid Swept AABB based playerphysics. There's is some bugs related to float rounding errors tho.
Quake-style strafe-jumping mechanics that dont work quite right, but are fun enough
Server can save the terrain to a disk and read it back.
A lot of obscure interesting features that nobody needs (like my fancy input configs)


# How to run
### Server
You need to install Node.js and https://github.com/theturtle32/WebSocket-Node
Then just hopefully run the the server.bat 
or ``node server.js`` in ``src/server/``
### Client
Publish this whole thing on a web server. Note: HTTPS doesn't quite work right.

# License
MIT
