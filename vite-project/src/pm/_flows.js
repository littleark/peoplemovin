(function($) {

  var $host = "https://peoplemov.in/support/getflows3.php?not_json=1",
    $info_host = "support/getcountry.php";

  var Flows = new function() {

    var contents = $("#contents");


    var margins = { left: 170, top: 10, right: 170, bottom: 0, padding: { left: 0, right: 0 } };

    var canvas = {},
      ctx = {};

    var ix_ctx;

    var processing = false;

    var datamovin = {};
    var vertical = true;
    // var colors = new Colors();

    var last = null,
      previous = null;


    var ititle = {
      el: $(".ititle")
    }

    var tooltip = {
      el: $("#tooltip"),
      from: $("#tooltip #from"),
      to: $("#tooltip #to"),
      flow: $("#tooltip #flow"),
      dot: $("#dot"),
      current: ""
    }


    window.showCountries = function(countries) {
      Finger.remove();
      hideContents();
      datamovin.showCountries(countries);
    }
    window.exportCanvas = function() {
      var canvas = document.getElementById("flows");
      var strDataUri = canvas.toDataURL("img/png;base64");//.replace("image/png", "image/octet-stream");
      //window.location.href=strDataUri;
      //var img=$("body").append("<img src=\""+strDataUri+"\"/>");
      //document.write("<img src='"+strDataUri+"'/>")
      $("#download").attr("src", strDataUri)

    }
    this.init = async function() {
      initDOM();
      if (support_canvas()) {
        var ua = navigator.userAgent;
        var isiOS = /iPad/i.test(ua) || /iPhone/i.test(ua) || /iPhone OS 3_1_2/i.test(ua) || /iPhone OS 3_2_2/i.test(ua);

        step = ($.browser.msie || isiOS) ? 8 : 4;
        (async function getMigration() {
          const locationCodes = await d3.csv('/data/location-codes.csv');
          console.log('LOCATION CODES', locationCodes)
          d3.csv('/data/data.csv')
            .then(function(rows) {
              const data = rows
                .filter(d => +d.code_origin < 900 && +d.code_destination < 900)
                .reduce((acc, d) => {
                  const row = {
                    src: d.origin.replace(/^[ \t]+/, '').replace(/[\*]+/gi, ''),
                    dst: d.destination.replace(/^[ \t]+/, '').replace(/[\*]+/gi, ''),
                    code_src: d.code_origin,
                    code_dst: d.code_destination,
                    total: {},
                    men: {},
                    women: {},
                  }
                  const years = [1990, 1995, 2000, 2005, 2010, 2015, 2020];
                  years.forEach(year => {
                    row.total[year] = +d[year].replace(/[ \t]+/g, '');
                    row.total.latestYear = d[year] !== '' ? year : row.total.latestYear;
                    row.men[year] = +d[`m${year}`].replace(/[ \t]+/g, '');
                    row.women[year] = +d[`w${year}`].replace(/[ \t]+/g, '');
                  })
                  const src_location = locationCodes.find(location => +location.creditorCode === +row.code_src);
                  const dst_location = locationCodes.find(location => +location.creditorCode === +row.code_dst);
                  if (src_location && dst_location) {
                    row.src_wb_code = src_location.debtorCode;
                    row.dst_wb_code = dst_location.debtorCode;

                  }
                  if (row.total[row.total.latestYear]) {
                    acc.push(row);
                  }

                  return acc;
                }, []);

              console.log('DATA DATA', data)

              const flowExtent = d3.extent(data, row => row.total[row.total.latestYear])
              const flowScale = d3.scaleLinear().domain([0, flowExtent[1]]).range([0, 100])

              const flowData = data.sort((a, b) => a.src.localeCompare(b.src)).reduce((acc, d) => {
                acc[d.src] = acc[d.src] ?? {
                  src: d.src,
                  code_src: d.code_src,
                  flows: {},
                  // d,
                };
                acc[d.src].flows[d.dst] = {
                  dst: d.dst,
                  code_dst: d.code_dst,
                  f: d.total[d.total?.latestYear],
                  v: flowScale(d.total[d.total?.latestYear]),
                  year: d.total.latestYear,
                }
                return acc;
              }, {});
              console.log('flowData', flowData)
              datamovin = new DataMovin();
              if (datamovin.init("flows", { flows: flowData, margins: margins, orientation: 'vertical', labels: countries })) {

                var canvas = datamovin.getCanvas(),
                  ratio = datamovin.getRatio();

                var ix = $("<canvas/>")
                  .attr({
                    id: "ix",
                    width: canvas.width,
                    height: canvas.height
                  })
                  .css({
                    width: (canvas.width / ratio) + "px",
                    height: (canvas.height / ratio) + "px"
                  })
                //.appendTo($("#flows_container"));

                ix_ctx = ix[0].getContext("2d");
                ix_ctx.scale(ratio, ratio);

                //contents.height(datamovin.getCanvas().height);


                datamovin.drawSources();
                datamovin.drawDestinations();
                datamovin.addLegend();

                vertical = datamovin.getOrientation() == 'vertical';


                var dm_interactions = new DataMovinInteractions();
                dm_interactions.init(datamovin, { canvas: $("#ux")[0] });

                dm_interactions.registerMouseEvents({
                  'click': showCountryInfo,
                  'mouseover': showCountryName,
                  'mouseoverbezier': showFlowInfo,
                  'mouseout': hideCountryName,
                  //'document_scrollwheel':hideCountryName,
                  'processing': handleProcessing
                });

                if (window.location.hash) {
                  var connection = window.location.hash.split("_");
                  switch (connection[0]) {
                    case '#f':
                      datamovin.drawOutFlow(connection[1], true);
                      var goToCountry = datamovin.getPointInfo(connection[1], 'src');
                      showCountryInfo(goToCountry, null, true);
                      Finger.init(false);
                      break;
                    case '#t':
                      datamovin.drawInFlow(connection[1], true);
                      var goToCountry = datamovin.getPointInfo(connection[1], 'dst');
                      showCountryInfo(goToCountry, null, true);
                      Finger.init(false);
                      break;
                    case '#c':
                      datamovin.drawFlowFromTo(connection[1], connection[2], true);
                      var goToCountry = datamovin.getPointInfo(connection[1], 'src');
                      showCountryInfo(goToCountry, connection[2], true);
                      Finger.init(false);
                      break;
                    default:
                      Finger.init(true);
                  }
                } else {
                  Finger.init(true);
                }


              }
            });
        })();
      } else {
        $("<div/>").attr("class", "alert").html("Unfortunately your browser does not support <span>HTML5</span>.<br/>Please upgrade to a modern browser to fully enjoy <span>people<strong>movin</strong></span>").prependTo("#contents").fadeIn(1000);
      }
    }
    function showFlowInfo(info) {
      ititle.el.hide();
      if (info.p) {



        tooltip.el.css({
          left: Math.round(info.p.x) + "px",
          top: Math.round(info.p.y - 60) + "px",
        }).show();
        //console.log(info)

        tooltip.dot.css({
          left: Math.round(info.p.x) + "px",
          top: Math.round(info.p.y) + "px",
        }).show();

        if ((info.i.flow.f + "_" + info.i.flow.t) == tooltip.current) {
          //console.log((info.i.flow.f+"_"+info.i.flow.t),"==",tooltip.current)
          return;
        }

        tooltip.current = info.i.flow.f + "_" + info.i.flow.t;
        console.log(info)
        // tooltip.from.text(window.countries[info.i.flow.f]);
        // tooltip.to.text(window.countries[info.i.flow.t]);
        tooltip.from.text(info.i.flow.f);
        tooltip.to.text(info.i.flow.t);
        tooltip.flow.text(info.i.flow.q.toLocaleString());
        return;
        //console.log(datamovin);

        // ATTEMPT TO PAINT HOVERED CURVE
        info.i.ctx = ix_ctx;
        info.i["stroke-width"] = info.i["stroke-width"] > 1 ? info.i["stroke-width"] : 1;
        info.i.color = "180,100%,50%";;
        info.i.color2 = null;
        requestAnimationFrame(function() {
          datamovin.clean(
            ix_ctx,
            {
              transparent: true,
              area: {
                x1: info.b[0].x,
                y1: info.b[0].y,
                x2: info.b[3].x,
                y2: info.b[3].y
              }
            }
          );
          datamovin.drawCurve(info.b[0].x, info.b[0].y, info.b[3].x, info.b[3].y, info.i);
        })


      } else {
        hideTooltip();
      }


    }
    function hideTooltip() {
      tooltip.current = null;
      tooltip.el.hide();
      tooltip.dot.hide();
      return;
      datamovin.clean(ix_ctx, {
        transparent: true
      });
    }
    function showCountryName(country_info) {
      hideTooltip();
      if (country_info && country_info.type) {
        if (country_info.type == 'src') {

          $("#src_title").html(window.countries[country_info.name]).show();
          $("#dst_title").hide();
          if (contents.hasClass("ontop")) {
            left = 170 - $("#src_title").outerWidth();
          } else {
            left = 140 + 50;
          }



          position = {
            top: (country_info.y + country_info.h / 2 - $("#src_title").height() / 2 - 4) + "px",
            left: left
          };

          last = {
            country: country_info.name,
            el: "#src_title",
            direction: 'src',
            pos: position
          };

        } else {

          $("#dst_title").html(window.countries[country_info.name]).show();
          $("#src_title").hide();
          position = {
            top: (country_info.y + country_info.h / 2 - $("#dst_title").height() / 2 - 4) + "px"
          };
          if (contents.hasClass("ontop")) {
            position.left = 170 + 600;
            position.right = 'auto';
          } else {
            position.right = 140 + 50;
            position.left = "auto";
          }

          last = {
            country: country_info.name,
            el: "#dst_title",
            direction: 'dst',
            pos: position
          };

        }

        $(last.el).attr("rel", ((last.direction == 'src') ? 'from_' : 'to_') + last.country).show().css(last.pos).show();
      } else {
        last = null;
        hideCountryName(this);

      }
    }
    function hideCountryName(e) {
      var relTarget = e.relatedTarget || e.toElement;
      if (!relTarget || (relTarget && relTarget.className && relTarget.className != 'ititle')) {
        ititle.el.hide();
      }
      hideTooltip();
    }
    function handleMouseMove(e) {
      var relTarget = e.relatedTarget || e.toElement;
    }
    function showCountryInfo(country_info, other, animate) {
      Finger.remove();
      $(".info").hide();
      if (country_info == -1) {
        window.location.hash = "!";
        //contents.show();
        showContents();
        return 0;
      }
      if (country_info) {
        //contents.hide();
        hideContents();
        ititle.el.hide();
        // getCountryInfo(country_info.name,country_info.type,country_info.x,country_info.y+country_info.h/2+10,other,animate);
        if (!other) {
          if (country_info.type == 'src') {
            window.location.hash = "f_" + country_info.name;
          } else {
            window.location.hash = "t_" + country_info.name;
          }
        } else {
          var goToCountry = datamovin.getPointInfo(other, 'dst');
          // getCountryInfo(goToCountry.name,goToCountry.type,goToCountry.x,goToCountry.y+goToCountry.h/2+10,country_info.name);
          window.location.hash = "c_" + country_info.name + "_" + other;
        }
      } else {
        window.location.hash = "!";
      }
    }
    function getCountryInfo(country, direction, x, y, other, animate) {
      $.ajax({
        url: $info_host,
        data: {
          c: country,
          src: (direction == 'src' ? 1 : 0),
          o: (other ? other : '')
        },
        type: 'POST',
        dataType: 'html',
        success: function(html) {
          var position = {}

          if (vertical) {
            if (direction == 'src') {
              left = $("#flows").position().left + margins.left - $("#" + direction + "_info").outerWidth();
            } else {
              left = $("#flows").position().left + x + 20;//+margins.right;//x-$("#"+direction+"_info").outerWidth();
            }
            position = {
              top: (y + 80) + "px",
              left: left
            };
          } else {
            position = {
              left: (x - 205) + "px",
              top: (y + 80 + ((direction == 'src') ? 15 : -340)) + "px"
            };
          }
          //$(".info").hide();
          $("#" + direction + "_info").show().html(html).css(position);


          if (animate) {
            var scrolling = {
              scrollTop: y + "px"
            };
            if (!datamovin.getOrientation() == 'horizontal') {
              scrolling = {
                scrollLeft: x + "px"
              };
            }
            $('html,body').animate(scrolling, 1000);
          }
        }
      });
    }
    function initDOM() {

      contents = $("#contents");

      $("#dst_info").css("left", "745px");//.offset({top:$("#dst_info").offset().top,left:$("#flows").offset().left+canvas.width})
      $(".more").click(function(e) {
        e.preventDefault();
        var ul = $(this).parent().parent().find(".hidden");
        if (ul.is(":visible")) {
          ul.fadeOut(1000);
          $(this).html("see more");
        } else {
          $("ul.hidden:visible").hide();
          ul.fadeIn(1000);
          $(this).html("see less");
          $('html,body').animate({
            scrollTop: $(this).offset().top - 20
          }, 1000);
        }
        return false;
      });
      function manageLIClik(li, country, direction) {

        var dir = (direction == 'to') ? 'dst' : 'src',
          data = datamovin.getCurrent()[(direction == 'to') ? 'src' : 'dst'];

        if (!li.hasClass('sel')) {
          $(".info ul li a.sel").removeClass("sel");
          li.addClass("sel");
          if (direction == 'to') {
            datamovin.clean();
            datamovin.drawFlowFromTo(data[0], country, true);
            window.location.hash = "c_" + data[0] + "_" + country;
          } else {
            datamovin.drawFlowFromTo(country, data[0], true);
            window.location.hash = "c_" + country + "_" + data[0];
          }
          var info = datamovin.getPointInfo(country, dir);
          // getCountryInfo(country,dir,info.x,info.y+info.h/2+10,data[0]);
        } else {

          var goToCountry = datamovin.getPointInfo(country, dir);
          var scrolling = {
            scrollTop: goToCountry.y + "px"
          };
          if (!vertical) {
            scrolling = {
              scrollLeft: goToCountry.x + "px"
            };
          }
          $('html,body').animate(scrolling, 1000);
        }

      }

      $(".info ul li a.il").live("click", function(e) {
        e.preventDefault();
        Finger.remove();

        var $this = $(this);

        var country = this.id.split("_")
        if (country[0] == 'to') {
          manageLIClik($this, country[1], country[0]);
        } else {
          manageLIClik($this, country[1], country[0]);
        }


        return false;
      });
      $(".info h2 a").live("click", function(e) {
        e.preventDefault();

        $(".info ul li a.sel").removeClass("sel");

        var $this = $(this),
          country = this.id.split("_");

        if (country[0] == 'to') {
          datamovin.drawInFlow(country[1], true);
        } else {
          datamovin.drawOutFlow(country[1], true);
        }

        window.location.hash = $this.attr("href");

        return false;
      });
      $(".info a.close").live("click", function(e) {
        e.preventDefault();
        $(".info").hide();
      });
      ititle.el.live("click", function(e) {
        e.preventDefault();
        var $this = $(this);

        var country = $this.attr("rel").split("_");
        if (!$("#" + $this.attr("rel")).is(":visible")) {
          if (country[0] == 'to') {
            handleProcessing('start', 'dst');
            setTimeout(function tm() {
              datamovin.drawInFlow(country[1], true);
              showCountryInfo(datamovin.getPointInfo(country[1], 'dst'));
              setTimeout(function ttm() { handleProcessing('end', 'dst'); }, 250);
            }, 100);
          } else {
            handleProcessing('start', 'src');
            setTimeout(function tm() {
              datamovin.drawOutFlow(country[1], true);
              showCountryInfo(datamovin.getPointInfo(country[1], 'src'));
              setTimeout(function ttm() { handleProcessing('end', 'src'); }, 250);
            }, 100);
          }
        }

        return false;
      });

      $(".par ul li a").click(function(e) {
        e.preventDefault();
        Finger.remove();
        if ($("#contents").css("opacity") == 1) {
          var country = this.id.split("_");


          if (country[0] == 'from') {
            datamovin.drawOutFlow(country[1], true);
            showCountryInfo(datamovin.getPointInfo(country[1], 'src'), null, true);
          } else if (country[0] == 'to') {
            datamovin.drawInFlow(country[1], true);
            showCountryInfo(datamovin.getPointInfo(country[1], 'dst'), null, true);
          } else {
            datamovin.drawFlowFromTo(country[1], country[2], true);
            showCountryInfo(datamovin.getPointInfo(country[1], 'src'), country[2], true);
          }

          window.location.hash = this.href.split("#")[1];

        } else {
          $("#contents").click();
        }
        return false;
      });
    }
    function showContents() {
      contents.css({
        "z-index": 1010
      }).addClass("ontop");
      $("#wrapper").addClass("ontop");

    }
    function hideContents() {
      contents.css({
        "z-index": 940
      }).removeClass("ontop");
      $("#wrapper").removeClass("ontop");
    }
    function handleProcessing(status, direction) {
      if (status == 'start') {
        var title = $("#" + direction + "_title");
        title.html(title.html() + " <img src=\"img/loading.gif\"/>");
      }
      if (status == 'end') {
      }
    }
  };

  Flows.init();

}(jQuery));
