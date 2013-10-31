/*global jQuery, friGame */
/*jslint nomen: true, sloppy: true, white: true, browser: true */

// Copyright (c) 2011-2013 Franco Bugnano

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
// based on easing equations from Robert Penner (http://www.robertpenner.com/easing)

(function ($, fg) {
	var
		speeds = {
			slow: 600,
			fast: 200,
			_default: 400
		}
	;

	fg.fx = {};

	fg.fx.easing = {
		linear: function (t) {
			return t;
		},
		swing: function (t) {
			return 0.5 - (Math.cos(t * Math.PI) / 2);
		},
		easeInQuad: function (t) {
			return t * t;
		},
		easeOutQuad: function (t) {
			return -1 * t * (t - 2);
		},
		easeInOutQuad: function (t) {
			t *= 2;
			if (t < 1) {
				return (t * t) / 2;
			}

			t -= 1;
			return -((t * (t - 2)) - 1) / 2;
		},
		easeInCubic: function (t) {
			return t * t * t;
		},
		easeOutCubic: function (t) {
			t -= 1;
			return (t * t * t) + 1;
		},
		easeInOutCubic: function (t) {
			t *= 2;
			if (t < 1) {
				return (t * t * t) / 2;
			}

			t -= 2;
			return ((t * t * t) + 2) / 2;
		},
		easeInQuart: function (t) {
			return t * t * t * t;
		},
		easeOutQuart: function (t) {
			t -= 1;
			return -1 * ((t * t * t * t) - 1);
		},
		easeInOutQuart: function (t) {
			t *= 2;
			if (t < 1) {
				return (t * t * t * t) / 2;
			}

			t -= 2;
			return -((t * t * t * t) - 2) / 2;
		},
		easeInQuint: function (t) {
			return t * t * t * t * t;
		},
		easeOutQuint: function (t) {
			t -= 1;
			return (t * t * t * t * t) + 1;
		},
		easeInOutQuint: function (t) {
			t *= 2;
			if (t < 1) {
				return (t * t * t * t * t) / 2;
			}

			t -= 2;
			return ((t * t * t * t * t) + 2) / 2;
		},
		easeInSine: function (t) {
			return (-1 * Math.cos(t * (Math.PI / 2))) + 1;
		},
		easeOutSine: function (t) {
			return Math.sin(t * (Math.PI / 2));
		},
		easeInOutSine: function (t) {
			return -(Math.cos(Math.PI * t) - 1) / 2;
		},
		easeInExpo: function (t) {
			return (t === 0) ? 0 : Math.pow(2, 10 * (t - 1));
		},
		easeOutExpo: function (t) {
			return (t === 1) ? 1 : (-Math.pow(2, -10 * t) + 1);
		},
		easeInOutExpo: function (t) {
			if (t === 0) {
				return 0;
			}

			if (t === 1) {
				return 1;
			}

			t *= 2;
			if (t < 1) {
				return Math.pow(2, 10 * (t - 1)) / 2;
			}

			t -= 1;
			return (-Math.pow(2, -10 * t) + 2) / 2;
		},
		easeInCirc: function (t) {
			return -1 * (Math.sqrt(1 - (t * t)) - 1);
		},
		easeOutCirc: function (t) {
			t -= 1;
			return Math.sqrt(1 - (t * t));
		},
		easeInOutCirc: function (t) {
			t *= 2;
			if (t < 1) {
				return -(Math.sqrt(1 - (t * t)) - 1) / 2;
			}

			t -= 2;
			return (Math.sqrt(1 - (t * t)) + 1) / 2;
		},
		easeInElastic: function (t) {
			var
				p = 0.3,
				s = p / 4
			;

			if (t === 0) {
				return 0;
			}

			if (t === 1) {
				return 1;
			}

			t -= 1;
			return -(Math.pow(2, 10 * t) * Math.sin((t - s) * (2 * Math.PI) / p));
		},
		easeOutElastic: function (t) {
			var
				p = 0.3,
				s = p / 4
			;

			if (t === 0) {
				return 0;
			}

			if (t === 1) {
				return 1;
			}

			return (Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p)) + 1;
		},
		easeInOutElastic: function (t) {
			var
				p = 0.45,
				s = p / 4
			;

			if (t === 0) {
				return 0;
			}

			t *= 2;
			if (t === 2) {
				return 1;
			}

			if (t < 1) {
				t -= 1;
				return -(Math.pow(2, 10 * t) * Math.sin((t - s) * (2 * Math.PI) / p)) / 2;
			}

			t -= 1;
			return ((Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p)) / 2) + 1;
		},
		easeInBack: function (t) {
			var
				s = 1.70158
			;

			return t * t *(((s + 1) * t) - s);
		},
		easeOutBack: function (t) {
			var
				s = 1.70158
			;

			t -= 1;
			return (t * t * (((s + 1) * t) + s)) + 1;
		},
		easeInOutBack: function (t) {
			var
				s = 1.70158 * 1.525
			;

			t *= 2;
			if (t < 1) {
				return (t * t * (((s + 1) * t) - s)) / 2;
			}

			t -= 2;
			return (t * t * (((s + 1) * t) + s) + 2) / 2;
		},
		easeInBounce: function (t) {
			return 1 - fg.fx.easing.easeOutBounce(1 - t);
		},
		easeOutBounce: function (t) {
			if (t < (1 / 2.75)) {
				return 7.5625 * t * t;
			}

			if (t < (2 / 2.75)) {
				t -= 1.5 / 2.75;
				return 7.5625 * (t * t) + 0.75;
			}

			if (t < (2.5 / 2.75)) {
				t -= 2.25 / 2.75;
				return 7.5625 * (t * t) + 0.9375;
			}

			t -= 2.625 / 2.75;
			return 7.5625 * (t * t) + 0.984375;
		},
		easeInOutBounce: function (t) {
			if (t < 0.5) {
				return fg.fx.easing.easeInBounce(t * 2) / 2;
			}

			return (fg.fx.easing.easeOutBounce((t * 2) - 1) / 2) + 0.5;
		}
	};

	fg.fx.properties = {
		left: {
			get: function (s) {
				return s.left;
			},
			set: function (s, value) {
				s.move({left: value});
			}
		},
		right: {
			get: function (s) {
				return s.right;
			},
			set: function (s, value) {
				s.move({right: value});
			}
		},
		centerx: {
			get: function (s) {
				return s.centerx;
			},
			set: function (s, value) {
				s.move({centerx: value});
			}
		},
		top: {
			get: function (s) {
				return s.top;
			},
			set: function (s, value) {
				s.move({top: value});
			}
		},
		bottom: {
			get: function (s) {
				return s.bottom;
			},
			set: function (s, value) {
				s.move({bottom: value});
			}
		},
		centery: {
			get: function (s) {
				return s.centery;
			},
			set: function (s, value) {
				s.move({centery: value});
			}
		},
		width: {
			get: function (s) {
				return s.width;
			},
			set: function (s, value) {
				s.resize({width: value});
			}
		},
		height: {
			get: function (s) {
				return s.height;
			},
			set: function (s, value) {
				s.resize({height: value});
			}
		},
		halfWidth: {
			get: function (s) {
				return s.halfWidth;
			},
			set: function (s, value) {
				s.resize({halfWidth: value});
			}
		},
		halfHeight: {
			get: function (s) {
				return s.halfHeight;
			},
			set: function (s, value) {
				s.resize({halfHeight: value});
			}
		},
		radius: {
			get: function (s) {
				return s.radius;
			},
			set: function (s, value) {
				s.resize({radius: value});
			}
		},
		rotate: {
			get: function (s) {
				return s.rotate();
			},
			set: function (s, value) {
				s.rotate(value);
			}
		},
		scale: {
			get: function (s) {
				return s.scale();
			},
			set: function (s, value) {
				s.scale(value);
			}
		},
		scalex: {
			get: function (s) {
				return s.scalex();
			},
			set: function (s, value) {
				s.scalex(value);
			}
		},
		scaley: {
			get: function (s) {
				return s.scaley();
			},
			set: function (s, value) {
				s.scaley(value);
			}
		},
		opacity: {
			get: function (s) {
				return s.opacity();
			},
			set: function (s, value) {
				s.opacity(value);
			}
		}
	};

	function tweenStep() {
		var
			queue = this.fx.queue,
			len_queue = queue.length,
			i_queue,
			remove_queue = [],
			len_remove_queue,
			tween_obj,
			property,
			i_property,
			property_list,
			len_property_list,
			step
		;

		// Process all the tweens in the queue
		for (i_queue = 0; i_queue < len_queue; i_queue += 1) {
			tween_obj = queue[i_queue];
			property_list = tween_obj.property_list;
			len_property_list = property_list.length;

			// This object has finished its tweening
			if (tween_obj.current_step >= tween_obj.num_step) {
				// Set every property to its target value
				for (i_property = 0; i_property < len_property_list; i_property += 1) {
					property = property_list[i_property];
					property.setValue(this, property.target_value);
				}

				// Call the complete callback
				if (tween_obj.callback) {
					tween_obj.callback.call(this, this);
				}

				// Mark this object for removal
				remove_queue.unshift(i_queue);
			} else {
				step = tween_obj.easing(tween_obj.current_step / tween_obj.num_step);

				// Set the properties to the current value
				for (i_property = 0; i_property < len_property_list; i_property += 1) {
					property = property_list[i_property];
					property.setValue(this, property.start_value + (property.change * step));
				}

				tween_obj.current_step += 1;
			}
		}

		// Remove all the completed tweens
		len_remove_queue = remove_queue.length;
		for (i_queue = 0; i_queue < len_remove_queue; i_queue += 1) {
			queue.splice(i_queue, 1);
		}

		// If there are no more tweens in the queue, this callback can be stopped
		if (queue.length === 0) {
			this.fx.inprogress = false;

			// return true in order to stop the callback
			return true;
		}
	}

	$.extend(fg.PBaseSprite, {
		tween: function (properties, options) {
			var
				new_options = options || {},
				easing_list = fg.fx.easing,
				properties_list = fg.fx.properties,
				duration = new_options.duration,
				speed,
				property,
				tween_obj,
				property_list,
				property_func,
				start_value,
				target_value
			;

			this.fx = this.fx || {
				queue: [],
				inprogress: false
			};

			if (typeof duration === 'number') {
				speed = duration;
			} else if (speeds[duration]) {
				speed = speeds[duration];
			} else {
				speed = speeds._default;
			}

			tween_obj = {
				current_step: 0,
				num_step: Math.round(speed / fg.REFRESH_RATE) || 1,
				easing: easing_list[new_options.easing] || easing_list.swing,
				callback: new_options.callback,
				property_list: []
			};

			property_list = tween_obj.property_list;

			for (property in properties) {
				if (properties_list[property]) {
					property_func = properties_list[property];

					start_value = property_func.get(this);
					target_value = properties[property];

					property_list.push({
						start_value: start_value,
						target_value: target_value,
						change: target_value - start_value,
						setValue: property_func.set
					});
				}
			}

			this.fx.queue.push(tween_obj);
			if (!(this.fx.inprogress)) {
				this.fx.inprogress = true;
				this.registerCallback(tweenStep);
			}

			return this;
		},

		fadeIn: function (duration, callback) {
			return this.tween({opacity: 1}, {
				duration: duration,
				callback: callback
			});
		},

		fadeOut: function (duration, callback) {
			return this.tween({opacity: 0}, {
				duration: duration,
				callback: callback
			});
		},

		fadeTo: function (duration, opacity, callback) {
			return this.tween({opacity: opacity}, {
				duration: duration,
				callback: callback
			});
		}
	});
}(jQuery, friGame));

