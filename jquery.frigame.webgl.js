/*global jQuery, Float32Array, mat4 */
/*jslint bitwise: true, sloppy: true, white: true, browser: true */

// Copyright (c) 2011-2012 Franco Bugnano

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Uses ideas and APIs inspired by:
// gameQuery Copyright (c) 2008 Selim Arsever (gamequery.onaluf.org), licensed under the MIT

(function ($) {
	var
		friGame = $.friGame
	;

	friGame.PrototypeAnimation = Object.create(friGame.PrototypeBaseAnimation);
	$.extend(friGame.PrototypeAnimation, {
		initBuffers: function () {
			var
				gl = friGame.gl,
				details = this.details,
				halfWidth = details.halfWidth,
				halfHeight = details.halfHeight,
				vertices,
				vertexPositionBuffer
			;

			if (!gl) {
				return;
			}

			vertexPositionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
			vertices = [
				halfWidth, halfHeight, 0,
				-halfWidth, halfHeight, 0,
				halfWidth, -halfHeight, 0,
				-halfWidth, -halfHeight, 0
			];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			vertexPositionBuffer.itemSize = 3;
			vertexPositionBuffer.numItems = 4;

			this.vertexPositionBuffer = vertexPositionBuffer;
		},

		initTexture: function () {
			var
				gl = friGame.gl,
				options = this.options,
				details = this.details,
				img = details.img,
				img_width = img.width,
				img_height = img.height
			;

			if (!gl) {
				return;
			}

			this.texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.bindTexture(gl.TEXTURE_2D, null);

			this.textureSize = new Float32Array([options.frameWidth / img_width, options.frameHeight / img_height]);
			options.offsetx /= img_width;
			details.multix /= img_width;
			details.deltax /= img_width;
			options.offsety /= img_height;
			details.multiy /= img_height;
			details.deltay /= img_height;
		}
	});

	friGame.getShader = function (str, id) {
		var
			gl = friGame.gl,
			shader
		;

		if (!gl) {
			return;
		}

		shader = gl.createShader(id);

		gl.shaderSource(shader, str);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			return null;
		}

		return shader;
	};

	friGame.initShaders = function () {
        var
			gl = friGame.gl,
			fragmentShader,
			vertexShader,
			shaderProgram
		;

		if (!gl) {
			return;
		}

        fragmentShader = friGame.getShader([
			'#ifdef GL_ES',
			'precision highp float;',
			'#endif',

			'varying vec2 vTextureCoord;',

			'uniform sampler2D uSampler;',

			'void main(void) {',
			'	gl_FragColor = texture2D(uSampler, vTextureCoord);',
			'}'
		].join('\n'), gl.FRAGMENT_SHADER);

        vertexShader = friGame.getShader([
			'attribute vec3 aVertexPosition;',
			'attribute vec2 aTextureCoord;',

			'uniform mat4 uMVMatrix;',
			'uniform mat4 uPMatrix;',

			'varying vec2 vTextureCoord;',

			'uniform vec2 uTextureOffset;',
			'uniform vec2 uTextureSize;',

			'void main(void) {',
			'	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',
			'	vTextureCoord = uTextureOffset + (uTextureSize * aTextureCoord);',
			'}'
		].join('\n'), gl.VERTEX_SHADER);

		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			return;
		}

		gl.useProgram(shaderProgram);

		shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
		gl.enableVertexAttribArray(shaderProgram.aVertexPosition);

		shaderProgram.aTextureCoord = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
		gl.enableVertexAttribArray(shaderProgram.aTextureCoord);

		shaderProgram.uPMatrix = gl.getUniformLocation(shaderProgram, 'uPMatrix');
		shaderProgram.uMVMatrix = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
		shaderProgram.uSampler = gl.getUniformLocation(shaderProgram, 'uSampler');

		shaderProgram.uTextureSize = gl.getUniformLocation(shaderProgram, 'uTextureSize');
		shaderProgram.uTextureOffset = gl.getUniformLocation(shaderProgram, 'uTextureOffset');

		friGame.shaderProgram = shaderProgram;
	};

	friGame.initBuffers = function () {
        var
			gl = friGame.gl,
			textureCoords,
			textureCoordBuffer
		;

		if (!gl) {
			return;
		}

		textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
		textureCoords = [
			// Front face
			1, 1,
			0, 1,
			1, 0,
			0, 0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
		textureCoordBuffer.itemSize = 2;
		textureCoordBuffer.numItems = 4;

		friGame.textureCoordBuffer = textureCoordBuffer;
	};

	friGame.mvPushMatrix = function () {
		var
			copy = mat4.create()
		;

		mat4.set(friGame.mvMatrix, copy);
		friGame.mvMatrixStack.push(copy);
	};

	friGame.mvPopMatrix = function () {
		var
			mvMatrixStack = friGame.mvMatrixStack
		;

		if (mvMatrixStack.length) {
			friGame.mvMatrix = mvMatrixStack.pop();
		}
	};

	friGame.PrototypeSprite = Object.create(friGame.PrototypeBaseSprite);
	$.extend(friGame.PrototypeSprite, {
		draw: function () {
			var
				options = this.options,
				details = this.details,
				animation = options.animation,
				angle = details.angle,
				scalex = details.scalex,
				scaley = details.scaley,
				fliph = details.fliph,
				flipv = details.flipv,
				animation_options,
				animation_details,
				frameWidth,
				frameHeight,
				currentFrame = details.currentFrame,
				gl = friGame.gl,
				shaderProgram = friGame.shaderProgram,
				mvMatrix = friGame.mvMatrix,
				pMatrix = friGame.pMatrix
			;

			if (animation && !details.hidden) {
				animation_options = animation.options;
				animation_details = animation.details;
				frameWidth = animation_options.frameWidth;
				frameHeight = animation_options.frameHeight;

				friGame.mvPushMatrix();
				mat4.translate(mvMatrix, [details.translatex, details.translatey, 0]);
				if (angle) {
					mat4.rotate(mvMatrix, angle, [0, 0, 1]);
				}
				if ((scalex !== 1) || (scaley !== 1) || (fliph !== 1) || (flipv !== 1)) {
					mat4.scale(mvMatrix, [fliph * scalex, flipv * scaley, 1]);
				}

				gl.bindBuffer(gl.ARRAY_BUFFER, animation.vertexPositionBuffer);
				gl.vertexAttribPointer(shaderProgram.aVertexPosition, animation.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

				gl.bindBuffer(gl.ARRAY_BUFFER, friGame.textureCoordBuffer);
				gl.vertexAttribPointer(shaderProgram.aTextureCoord, friGame.textureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, animation.texture);
				gl.uniform1i(shaderProgram.uSampler, 0);

				gl.uniform2fv(shaderProgram.uTextureSize, animation.textureSize);
				gl.uniform2f(
					shaderProgram.uTextureOffset,
					animation_options.offsetx + details.multix + (currentFrame * animation_details.deltax),
					animation_options.offsety + details.multiy + (currentFrame * animation_details.deltay)
				);

				gl.uniformMatrix4fv(shaderProgram.uPMatrix, false, pMatrix);
				gl.uniformMatrix4fv(shaderProgram.uMVMatrix, false, mvMatrix);

				gl.drawArrays(gl.TRIANGLE_STRIP, 0, animation.vertexPositionBuffer.numItems);

				friGame.mvPopMatrix();
			}
		}
	});

	friGame.PrototypeSpriteGroup = Object.create(friGame.PrototypeBaseSpriteGroup);
	$.extend(friGame.PrototypeSpriteGroup, {
		init: function (name, options, parent) {
			var
				gl,
				dom,
				width,
				height,
				str_width,
				str_height,
				animations = friGame.animations,
				len_animations = animations.length,
				i,
				mvMatrix = mat4.create(),
				mvMatrixStack = [],
				pMatrix = mat4.create()
			;

			friGame.PrototypeBaseSpriteGroup.init.apply(this, arguments);

			if (!parent) {
				width = options.width;
				height = options.height;
				str_width = String(width);
				str_height = String(height);

				dom = $(['<canvas id="', name, '" width ="', str_width, '" height="', str_height, '"></canvas>'].join('')).appendTo(options.parentDOM);
				dom.css({
					'position': 'absolute',
					'left': '0px',
					'top': '0px',
					'width': [str_width, 'px'].join(''),
					'height': [str_height, 'px'].join(''),
					'margin': '0px',
					'padding': '0px',
					'border': 'none',
					'outline': 'none',
					'background': 'none',
					'overflow': 'hidden'
				});

				this.dom = dom;

				try {
					gl = document.getElementById(name).getContext('experimental-webgl');
					gl.viewportWidth = width;
					gl.viewportHeight = height;
				} catch (e) {
				}

				if (gl) {
					friGame.gl = gl;
					friGame.initShaders();
					friGame.initBuffers();
					for (i = 0; i < len_animations; i += 1) {
						animations[i].initBuffers();
						animations[i].initTexture();
					}

					friGame.mvMatrix = mvMatrix;
					friGame.mvMatrixStack = mvMatrixStack;
					friGame.pMatrix = pMatrix;

					gl.clearColor(0, 0, 0, 0);
					gl.disable(gl.DEPTH_TEST);

					gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
					gl.clear(gl.COLOR_BUFFER_BIT);

					mat4.ortho(0, gl.viewportWidth, gl.viewportHeight, 0, -1, 1, pMatrix);

					mat4.identity(mvMatrix);
				}
			}
		},

		// Public functions

		remove: function () {
			friGame.PrototypeBaseSpriteGroup.remove.apply(this, arguments);

			if (this.dom) {
				this.dom.remove();
			}
		},

		// Implementation details

		draw: function () {
			var
				options = this.options,
				details = this.details,
				left = details.left,
				top = details.top,
				hidden = details.hidden,
				gl = friGame.gl,
				mvMatrix = friGame.mvMatrix,
				context_saved = false
			;

			if (!this.parent) {
				gl.clear(gl.COLOR_BUFFER_BIT);
			}

			if (this.layers.length && !hidden) {
				if (left || top) {
					if (!context_saved) {
						friGame.mvPushMatrix();
						context_saved = true;
					}

					mat4.translate(mvMatrix, [left, top, 0]);
				}

				friGame.PrototypeBaseSpriteGroup.draw.apply(this, arguments);

				if (context_saved) {
					friGame.mvPopMatrix();
				}
			}
		}
	});
}(jQuery));

