(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else {
		// Browser globals (root is window)
		root.exports = root.exports || {};
		root.exports.ViewportBackdrop = factory();
	}
}(this, function () {
	function ViewportBackdrop(options) {
		this.text = options.text;

		this._element = null;
		this._textElem = null;
	}

	ViewportBackdrop.prototype = {
		show: function() {
			var bgWidth,
				bgHeight,
				
				self = this;

			function ajustTextBlockPosition() {
				var selfMargin = 20,
					marginTop = (window.innerHeight + bgHeight) / 2 + selfMargin;
				self._textElem.style.marginTop = marginTop + 'px';
			}


			// html template is:
			// <div class='viewport-backdrop'>
			// 	<div class-'viewport-backdrop-text'>{text}</div>
			// </div>
			if (!this._element) {
				this._element = document.createElement('DIV');
				this._element.classList.add('viewport-backdrop');
				document.body.appendChild(this._element);

				this._textElem = document.createElement('DIV');
				this._textElem.classList.add('viewport-backdrop-text');
				this._element.appendChild(this._textElem);
				
				if (this.text) {
					this._textElem.innerHTML = this.text;
					
					if (typeof bgWidth === 'undefined' || typeof bgHeight === 'undefined') {
						getBackgroundImageSize(self._element, function(width, height) {
							// cache baground image size
							bgWidth = width;
							bgHeight = height;

							// this function uses bgWidth and bgHeight variables.
							// Only here they are properly initialized.
							ajustTextBlockPosition();
						});
					}
					else {
						ajustTextBlockPosition();
					}
					
					this._onWindowResize = throttle(ajustTextBlockPosition, 200);
					window.addEventListener('resize', this._onWindowResize);
				}
			}

			this._element.style.display = 'block';
		},

		hide: function() {
			this._element.style.display = 'none';
		},

		remove: function() {
			document.body.removeChild(this._element);

			window.removeEventListener('resize', this._onWindowResize);
			
			this._element = null;
		}
	};


	function getBackgroundImageSize(element, callback) {
		var img = new Image(),
			bgProp = window.getComputedStyle(element).getPropertyValue('background-image'),
			bgUrl = bgProp.replace(/url\(['"]?(.*?)['"]?\)/gi, '$1');

		// if the element doesn't have background-image style
		if (bgUrl === 'none') {
			callback(null, null);
			return;
		}

		// load image
		img.src = bgUrl;
		img.addEventListener('load', function(evt) {
			callback(img.width, img.height);
		});
	}

	// https://learn.javascript.ru/task/throttle
	function throttle(func, ms) {
		var isThrottled = false,
			savedArgs,
			savedThis;

		function wrapper() {
			if (isThrottled) {
				savedArgs = arguments;
				savedThis = this;
				return;
			}

			func.apply(this, arguments);
			
			isThrottled = true;
			
			setTimeout(function() {
				isThrottled = false;
				
				if (savedArgs) {
					wrapper.apply(savedThis, savedArgs);
					savedArgs = null;
					savedThis = null;
				}
			}, ms);
		}

		return wrapper;
	}

	// module export
	return ViewportBackdrop;
}));
