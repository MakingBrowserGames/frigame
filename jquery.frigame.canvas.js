/*global jQuery */
/*jslint white: true, browser: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, regexp: true, newcap: true, immed: true */

// Copyright (c) 2011 Franco Bugnano

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
// Uses the safeDrawImage function taken from:
// Akihabara Copyright (c) 2010 Francesco Cottone, http://www.kesiev.com/, licensed under the MIT

(function ($) {
	var
		friGame = $.friGame;

	friGame.PrototypeCanvasSprite = Object.create(friGame.PrototypeSprite);
	$.extend(friGame.PrototypeCanvasSprite, {
		posx: function (x) {
			var
				options = this.options;

			if (x !== undefined) {
				options.posx = x;

				return this;
			} else {
				return options.posx;
			}
		},

		posy: function (y) {
			var
				options = this.options;

			if (y !== undefined) {
				options.posy = y;

				return this;
			} else {
				return options.posy;
			}
		},

		transform: function () {
			// TO DO -- Maybe something should be done here to rotate the sprite
			return;
		},

		draw: function () {
			var
				options = this.options,
				animation = options.animation,
				angle = options.angle,
				animation_options = animation.options,
				currentFrame = options.currentFrame,
				ctx = friGame.ctx;

			if (angle) {
				// TO DO -- Currently broken
				ctx.save();
				ctx.rotate(angle);
			}

			friGame.safeDrawImage(
				ctx,
				animation.img,
				currentFrame * animation_options.deltax,
				currentFrame * animation_options.deltay,
				animation_options.frameWidth,
				animation_options.frameHeight,
				options.posx,
				options.posy,
				options.frameWidth,
				options.frameHeight
			);

			if (angle) {
				ctx.restore();
			}
		}
	});

	friGame.Sprite = function (name, options, parent) {
		var
			sprite = Object.create(friGame.PrototypeCanvasSprite);

		sprite.init(name, options, parent);

		return sprite;
	};

	friGame.PrototypeCanvasSpriteGroup = Object.create(friGame.PrototypeSpriteGroup);
	$.extend(friGame.PrototypeCanvasSpriteGroup, {
		init: function (name, parent) {
			var
				args = Array.prototype.slice.call(arguments),
				dom,
				parent_dom;

			if (parent === null) {
				parent_dom = $('#playground');
				dom = $(['<canvas id="', name, '" width ="', String(parent_dom.width()), '" height="', String(parent_dom.height()), '"></canvas>'].join('')).appendTo(parent_dom);
				friGame.ctx = document.getElementById(name).getContext('2d');
			}

			friGame.PrototypeSpriteGroup.init.apply(this, args);
		}
	});

	friGame.SpriteGroup = function (name, parent) {
		var
			group = Object.create(friGame.PrototypeCanvasSpriteGroup);

		group.init(name, parent);

		return group;
	};

	friGame.safeDrawImage = function (tox, img, sx, sy, sw, sh, dx, dy, dw, dh) {
		if ((!img) || (!tox)) {
			return;
		}

		if (sx < 0) {
			dx -= (dw / sw) * sx;
			sw += sx;
			sx = 0;
		}

		if (sy < 0) {
			dy -= (dh / sh) * sy;
			sh += sy;
			sy = 0;
		}

		if (sx + sw > img.width) {
			dw = (dw / sw) * (img.width - sx);
			sw = img.width - sx;
		}

		if (sy + sh > img.height) {
			dh = (dh / sh) * (img.height - sy);
			sh = img.height - sy;
		}

		if ((sh > 0) && (sw > 0) && (sx < img.width) && (sy < img.height)) {
			tox.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
		}
	};
}(jQuery));

