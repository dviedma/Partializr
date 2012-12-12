/*!
 * Partializr v1.0.1
 */

/*
 * Partializr works as a client side (Javascript) alternative to the popular
 * Apache Server Side Include (SSI). The objective is having all the benefits
 * of the SSI (being able to use "partials" in your HTML code, keeping your code DRY)
 * without having to tweak or configure (or even have) an Apache server, as it all happens
 * on the client side.
 *
 * Usage: to start using Partializr you just need to include this file in the head
 * of you HTML page. Notation for the "includes" (partials) is exactly the same as
 * the one used by Apache: <!--#include virtual="..." -->
 *
 * Support for partials added:
 * 1. Call virtual include like: <!--#include virtual="partials/_header.html?param1=hello&param2=goodbye" -->
 * 2. Output the value of the parameter in the partial like: <!--#echo var="param1" -->
 *
 * Considerations for this v1.0.1
 * - No nested partials (partials inside of partials)
 * - Partial files should be contained inside of a folder named "partials"
 * - Partials folder is a direct sibling of the HTML files we want to process
 *
 * Author       Daniel Viedma
 * Mail			daniel.viedma@rokkan.com
 */

$(document).ready(function() {
	window.Partializr = (function (document) {

		var version = '1.0.0',

		Partializr = {},

		bodyHTML = document.body.innerHTML,

		replacePartials = (function () {
			var partials = {},
			reg = new RegExp(
				"<!--#include\\s+virtual=\"[\\/]?(partials\\/)?(.*?)\\.html[\?]?(.*?)\"\\s+-->",
				"gi");

			var result = reg.exec(bodyHTML);
			loadPartial();

			function loadPartial(){
				var match = result[0],
				partial = result[2],
				queryString = result[3];

				//Process parameters
				var paramPairs = queryString.split('&');
				var paramNames = {};
				$.each(paramPairs, function(index, value) {
					var aux = value.split('=');
					paramNames[aux[0]] = aux[1];
				});

				//dynamically-created DOM nodes to handle the load result
				$('<div id="#ajax' + partial + '" />').appendTo('body').load('partials/' + partial + '.html', function(data){

					//Process parameters
					var partialHtml = data;
					var paramReg = new RegExp(
						"<!--#echo\\s+var=\"(.*?)\"\\s+-->",
						"gi");
					var paramResult;
					while ((paramResult = paramReg.exec(data)) !== null) {
						partialHtml = partialHtml.replace( paramResult[0], paramNames[paramResult[1]] );
					}

					partials[partial] = partialHtml;
					bodyHTML = bodyHTML.replace(match, partialHtml);
					getNextPartial();						//make the iteration sync with async load request (sequential)
				});
			}

			function getNextPartial() {
				if((result = reg.exec(bodyHTML)) !== null) {
					loadPartial();
				}else {
					$('body')[0].innerHTML = bodyHTML;		//$().html() strips the script tags
 				}
			}

			return partials;
		})();

		Partializr._version = version;
		Partializr.partials = replacePartials;	//Object that contains [partial_name: partial_content]

		return Partializr;

	})(this);
});
