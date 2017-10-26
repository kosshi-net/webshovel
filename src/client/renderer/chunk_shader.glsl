//{VERTEX_SHADER}

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMP;
uniform mat4 uMV;
uniform float viewdist;

varying mediump vec3 vVertexNormal;
varying mediump vec2 vTextureCoord;
varying mediump float vFogFactor;

varying mediump vec4 viewSpace;

void main(void) {
	viewSpace = uMP * uMV * vec4(aVertexPosition,1.0);

	float dist = length(uMV * vec4(aVertexPosition,1.0));
	vFogFactor = 1.0 -  pow( clamp( (dist)/(viewdist), 0.0, 1.0), 1.5);

	gl_Position = viewSpace;
	vTextureCoord = aTextureCoord;
	vVertexNormal = aVertexNormal;
}

//{VERTEX_SHADER}
//{FRAGMENT_SHADER}

precision mediump float;

varying mediump vec2 vTextureCoord;
varying mediump vec3 vVertexNormal;
uniform sampler2D uTexture;

varying mediump vec4 viewSpace;

varying mediump float vFogFactor;


vec4 fourTapSample(	vec2 tileOffset, 
					vec2 tileUV, 
					float tileSize,
					sampler2D atlas) {

	vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
	float totalWeight = 0.0;

	for(int dx=0; dx<2; dx++)
	for(int dy=0; dy<2; dy++) {

		vec2 quadTileUV = (( vec2(dx,dy)*0.5) + ( tileUV )) - 0.5;

		vec2 atlasUV = (tileOffset + 0.5 + quadTileUV ) * (tileSize);


		quadTileUV = abs( quadTileUV*2.0 );
		
		float w = pow(1.0 - max(quadTileUV.x,quadTileUV.y), 2.0);

		color += w * texture2D(atlas, atlasUV);
		totalWeight += w;
	}

	return color / totalWeight;
}


void main(void) {
	// float angle = clamp( 
	// 		dot( normalize( vec3(0.5,1.0,1.0) ), vVertexNormal ), 
	// 		0.3, 1.0 );

	vec3 colour = mix(
		vec3(0.0,0.0,0.0),

		fourTapSample( floor(vTextureCoord*8.0), fract(vTextureCoord*8.0), 1.0/8.0, uTexture ).xyz, 
		// texture2D(uTexture, vTextureCoord).xyz,

		vVertexNormal
	);

	gl_FragColor = vec4( 
		mix(
			vec3(0.8, 0.8, 1.0), 
				colour,
			vFogFactor), 
		1.0);
}
//{FRAGMENT_SHADER}