//{VERTEX_SHADER}

attribute vec3 aVertexPosition;

uniform mat4 uMP;
uniform mat4 uMV;

void main(void) {
	gl_Position= uMP * uMV * vec4(aVertexPosition,1.0);
}

//{VERTEX_SHADER}
//{FRAGMENT_SHADER}

precision mediump float;

void main(void) {
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
//{FRAGMENT_SHADER}