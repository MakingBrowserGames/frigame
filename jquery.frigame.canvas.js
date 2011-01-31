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

	friGame.PrototypeSprite = Object.create(friGame.PrototypeBaseSprite);
	$.extend(friGame.PrototypeSprite, {
		setAnimation: function (animation, callback) {
			var
				options,
				animation_options;

			friGame.PrototypeBaseSprite.setAnimation.apply(this, arguments);

			options = this.options;
			if (animation) {
				animation_options = animation.options;
				options.posOffsetX = -(animation_options.frameWidth / 2);
				options.posOffsetY = -(animation_options.frameHeight / 2);
				options.translateX = options.posx - options.posOffsetX;
				options.translateY = options.posy - options.posOffsetY;
			}

			return this;
		},

		posx: function (x) {
			var
				options = this.options;

			if (x !== undefined) {
				options.posx = x;
				options.translateX = x - options.posOffsetX;

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
				options.translateY = y - options.posOffsetY;

				return this;
			} else {
				return options.posy;
			}
		},

		transform: function () {
			// The transformations are applied in the draw() function
			return this;
		},

		draw: function () {
			var
				options = this.options,
				animation = options.animation,
				angle = options.angle,
				factor = options.factor,
				animation_options,
				currentFrame = options.currentFrame,
				ctx = friGame.ctx;

			if (animation && !options.hidden) {
				animation_options = animation.options;
				ctx.save();
				ctx.translate(options.translateX, options.translateY);
				if (angle) {
					ctx.rotate(angle);
				}
				if (factor !== 1) {
					ctx.scale(factor, factor);
				}

				friGame.safeDrawImage(
					ctx,
					animation.img,
					currentFrame * animation_options.deltax,
					currentFrame * animation_options.deltay,
					animation_options.frameWidth,
					animation_options.frameHeight,
					options.posOffsetX,
					options.posOffsetY,
					animation_options.frameWidth,
					animation_options.frameHeight
				);

				ctx.restore();
			}
		},

		show: function () {
			this.options.hidden = false;
		},

		hide: function () {
			this.options.hidden = true;
		}
	});

	friGame.PrototypeSpriteGroup = Object.create(friGame.PrototypeBaseSpriteGroup);
	$.extend(friGame.PrototypeSpriteGroup, {
		init: function (name, parent) {
			var
				dom,
				parent_dom;

			if (parent === null) {
				parent_dom = $('#playground');
				dom = $(['<canvas id="', name, '" width ="', String(parent_dom.width()), '" height="', String(parent_dom.height()), '"></canvas>'].join('')).appendTo(parent_dom);
				friGame.ctx = document.getElementById(name).getContext('2d');
			}

			friGame.PrototypeBaseSpriteGroup.init.apply(this, arguments);
		}
	});

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
