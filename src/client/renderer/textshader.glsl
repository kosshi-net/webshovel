//{VERTEX_SHADER}

attribute vec3 aVertexPosition;

uniform mat4 uMP;
uniform mat4 uMV;

varying mediump vec2 vTextureCoord;

void main(void) {
	vec4 viewSpace = uMP * uMV * vec4(aVertexPosition,1.0);

	gl_Position = viewSpace;
	vTextureCoord = vec2(aVertexPosition.x, 1.0-aVertexPosition.y);
}

//{VERTEX_SHADER}
//{FRAGMENT_SHADER}

precision mediump float;

varying mediump vec2 vTextureCoord;
uniform sampler2D uTexture;

uniform vec4 uTexCoord;
// u = tilesize, v = currenttile


void main(void) {
	
	vec4 color = texture2D(uTexture, uTexCoord.xy*uTexCoord.z + vTextureCoord * uTexCoord.z);
	color.w = (color.w);
	gl_FragColor = color;
}
//{FRAGMENT_SHADER}