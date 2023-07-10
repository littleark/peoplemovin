import DataMovin from './DataMovin';
import DataMovinInteractions from './DataMovinInteractions';
import { getMigration } from '../lib/data';

export function Flows() {

  var tooltip = {};

  var margins = { left: 170, top: 10, right: 170, bottom: 0, padding: { left: 0, right: 0 } };

  var canvas = {},
    ctx = {};

  var ix_ctx;

  var processing = false;

  let datamovin;
  var vertical = true;
  // var colors = new Colors();

  var last = null,
    previous = null;


  var ititle = {
    el: document.querySelector(".ititle")
  }

  // var tooltip = {
  //   el: $("#tooltip"),
  //   from: $("#tooltip #from"),
  //   to: $("#tooltip #to"),
  //   flow: $("#tooltip #flow"),
  //   dot: $("#dot"),
  //   current: ""
  // }


  window.showCountries = function(countries) {
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
  this.update = function() {
    if (datamovin && support_canvas()) {
      console.log('FLOWS UPDATE')

      var canvas = datamovin.getCanvas(),
        ratio = datamovin.getRatio();

      // var ix = $("<canvas/>")
      //   .attr({
      //     id: "ix",
      //     width: canvas.width,
      //     height: canvas.height
      //   })
      //   .css({
      //     width: (canvas.width / ratio) + "px",
      //     height: (canvas.height / ratio) + "px"
      //   })
      //.appendTo($("#flows_container"));

      // ix_ctx = ix[0].getContext("2d");
      // ix_ctx.scale(ratio, ratio);


      datamovin.update();
      datamovin.drawSources();
      datamovin.drawDestinations();
    };
  }
  this.init = async function() {
    initDOM();
    if (support_canvas()) {
      const flowData = await getMigration();

      datamovin = new DataMovin();
      if (datamovin.init("flows", {
        flows: flowData,
        margins: margins,
        orientation: 'vertical',
        labels: countries
      })) {

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

        datamovin.drawSources();
        datamovin.drawDestinations();
        // datamovin.addLegend();

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
              // Finger.init(false);
              break;
            case '#t':
              datamovin.drawInFlow(connection[1], true);
              var goToCountry = datamovin.getPointInfo(connection[1], 'dst');
              showCountryInfo(goToCountry, null, true);
              // Finger.init(false);
              break;
            case '#c':
              datamovin.drawFlowFromTo(connection[1], connection[2], true);
              var goToCountry = datamovin.getPointInfo(connection[1], 'src');
              showCountryInfo(goToCountry, connection[2], true);
              // Finger.init(false);
              break;
            default:
            // Finger.init(true);
          }
        } else {
          // Finger.init(true);
        }
      }
    }
    function showFlowInfo(info) {
      ititle.el.style.display = 'none'; //();
      // const tooltip = document.querySelector('#tooltip');
      tooltip = {
        el: $("#tooltip"),
        from: $("#tooltip #from"),
        to: $("#tooltip #to"),
        flow: $("#tooltip #flow"),
        dot: $("#dot"),
        current: ""
      }


      if (info.p) {

        // console.log('showFlowInfo', tooltip.el, document.querySelector('#tooltip'), info)
        // tooltip.style.left = Math.round(info.p.x) + "px";
        // tooltip.style.top = Math.round(info.p.y - 60) + "px";
        // tooltip.style.display = 'visible';
        tooltip.el.css({
          left: Math.round(info.p.x) + "px",
          top: Math.round(info.p.y - 60) + "px",
        }).show();
        //console.log(info)

        tooltip.dot.css({
          left: Math.round(info.p.x) + "px",
          top: Math.round(info.p.y) + "px",
        }).show();

        // console.log(tooltip)

        if ((info.i.flow.f + "_" + info.i.flow.t) == tooltip.current) {
          //console.log((info.i.flow.f+"_"+info.i.flow.t),"==",tooltip.current)
          return;
        }

        tooltip.current = info.i.flow.f + "_" + info.i.flow.t;
        // tooltip.from.text(window.countries[info.i.flow.f]);
        // tooltip.to.text(window.countries[info.i.flow.t]);
        tooltip.from.text(info.i.flow.f);
        tooltip.to.text(info.i.flow.t);
        tooltip.flow.text(info.i.flow.q.toLocaleString());
        // console.log(tooltip)
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
      let position;
      let left = 0;
      if (country_info && country_info.type) {
        if (country_info.type == 'src') {

          // $("#src_title").html(window.countries[country_info.name]).show();
          $("#src_title").html(country_info.name).show();
          $("#dst_title").hide();

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

          // $("#dst_title").html(window.countries[country_info.name]).show();
          $("#dst_title").html(country_info.name).show();
          $("#src_title").hide();
          position = {
            top: (country_info.y + country_info.h / 2 - $("#dst_title").height() / 2 - 4) + "px"
          };

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
        ititle.el.style.display = 'none';
      }
      hideTooltip();
    }
    function handleMouseMove(e) {
      var relTarget = e.relatedTarget || e.toElement;
    }
    function showCountryInfo(country_info, other, animate) {
      // Finger.remove();
      $(".info").hide();
      if (country_info == -1) {
        window.location.hash = "!";
        return 0;
      }
      if (country_info) {
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
      tooltip = {
        el: $("#tooltip"),
        from: $("#tooltip #from"),
        to: $("#tooltip #to"),
        flow: $("#tooltip #flow"),
        dot: $("#dot"),
        current: ""
      }

      // $("#dst_info").css("left", "745px");//.offset({top:$("#dst_info").offset().top,left:$("#flows").offset().left+canvas.width})
      /*
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
        // Finger.remove();

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
      */
    }
    function handleProcessing(status, direction) {
      const title = $("#" + direction + "_title");
      if (status == 'start') {
        title.html(title.html() + " <img src=\"/img/loading.gif\"/>");
      }
      if (status == 'end') {
        console.log('handleProcessing', status, direction)
        title.hide();
      }
    }
  }
}
