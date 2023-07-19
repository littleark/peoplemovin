import * as d3 from 'd3';

export const continentColors = {
  'ASIA': '#8dd3c7',
  'AFRICA': '#ffffb3',
  'EUROPE': '#1f78b4',
  'NORTHERN AMERICA': '#fb8072',
  'OCEANIA': '#80b1d3',
  'LATIN AMERICA AND THE CARIBBEAN': '#fdb462',
};

let continentMap = [];

export async function getMigration(showContinents = false) {
  // console.log('GET MIGRATION', showContinents)
  // const locationCodes = await d3.csv('/data/location-codes.csv');
  // console.log('LOCATION CODES', locationCodes)
  const continentCountryData = await d3.csv('/data/continents.csv');
  continentMap = continentCountryData.reduce((acc, d) => {
    acc[d.country] = d.continent.toUpperCase();
    return acc;
  }, {})
  const continents = ['ASIA', 'AFRICA', 'EUROPE', 'NORTHERN AMERICA', 'OCEANIA', 'LATIN AMERICA AND THE CARIBBEAN']

  const rows = await d3.csv('/data/data.csv');
  // console.log('ROWS', rows)
  const data = rows
    // .filter(d => +d.code_origin < 900 && +d.code_destination < 900)
    // .filter(d => +d.code_origin >= 900 && +d.code_destination >= 900 && d.origin !== 'WORLD' && d.destination !== 'WORLD')
    .filter(d => {
      const src = d.origin.replace(/^[ \t]+/, '').replace(/[\*]+/gi, '').trim();
      const dst = d.destination.replace(/^[ \t]+/, '').replace(/[\*]+/gi, '').trim();
      if (showContinents) {
        return continents.indexOf(src) > -1 && continents.indexOf(dst) > -1
      }
      return continentMap[src] && continentMap[dst]
      // return continents.indexOf(src) === -1 && continents.indexOf(dst) === -1

    })
    .reduce((acc, d) => {
      const row = {
        src: d.origin.replace(/^[ \t]+/, '').replace(/[\*]+/gi, '').trim(),
        dst: d.destination.replace(/^[ \t]+/, '').replace(/[\*]+/gi, '').trim(),
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
      // const src_location = locationCodes.find(location => +location.creditorCode === +row.code_src);
      // const dst_location = locationCodes.find(location => +location.creditorCode === +row.code_dst);
      // if (src_location && dst_location) {
      //   row.src_wb_code = src_location.debtorCode;
      //   row.dst_wb_code = dst_location.debtorCode;

      // }
      if (row.total[row.total.latestYear]) {
        acc.push(row);
      }
      return acc;
    }, []);

  // console.log('DATA DATA', data)

  const allNames = data.reduce((acc, d) => {
    if (acc.indexOf(d.src) === -1) {
      acc.push(d.src);
    }
    if (acc.indexOf(d.dst) === -1) {
      acc.push(d.dst);
    }
    return acc;
  }, [])
  // console.log('allNames', allNames)
  const flowExtent = d3.extent(data, row => row.total[row.total.latestYear])
  const flowScale = d3.scaleLinear().domain([0, flowExtent[1]]).range([0, 100])

  // const flowData = data.sort((a, b) => a.src.localeCompare(b.src)).reduce((acc, d) => {
  //   acc[d.src] = acc[d.src] ?? {
  //     src: d.src,
  //     code_src: d.code_src,
  //     flows: {},
  //     // d,
  //   };
  //   acc[d.src].flows[d.dst] = {
  //     dst: d.dst,
  //     code_dst: d.code_dst,
  //     f: d.total[d.total?.latestYear],
  //     v: flowScale(d.total[d.total?.latestYear]),
  //     year: d.total.latestYear,
  //   }
  //   return acc;
  // }, {});
  const flowData = data.sort((a, b) => a.src.localeCompare(b.src)).reduce((acc, d) => {
    acc[d.src] = acc[d.src] ?? {
      src: d.src,
      continent: continentMap[d.src] ?? d.src,
      code_src: d.code_src,
      flows: {},
      // d,
    };
    return acc;
  }, {});

  data
    .sort((a, b) => b.total[b.total?.latestYear] - a.total[a.total?.latestYear])
    .forEach(d => {
      flowData[d.src].flows[d.dst] = {
        dst: d.dst,
        continent: continentMap[d.dst] ?? d.dst,
        code_dst: d.code_dst,
        f: d.total[d.total?.latestYear],
        v: flowScale(d.total[d.total?.latestYear]),
        year: d.total.latestYear,
      }
    })


  console.log('flowData', flowData)
  return flowData;
};

export function initFlows(flows, step = 10) {
  if (!flows)
    return null;
  let src = {},
    dst = {};
  var src_values = { max: 0, min: 10000 },
    dst_values = { max: 0, min: 1 };

  for (var s in flows) {
    var source = flows[s];
    source.flow = 0;
    for (var d in source.flows) {
      source.flow += source.flows[d].v;
      if (!dst[d])
        dst[d] = { flow: 0, flows: {}, dst: d, continent: continentMap[d] ?? d, };
      dst[d].flow += source.flows[d].v;
      dst[d].flows[s] = {
        src: s,
        flow: source.flows[d].v,
        i: {
          q: source.flows[d].f,
          f: s,
          t: d
        }
      };
      dst_values.max = Math.max(dst_values.max, dst[d].flow);
      source.flows[d] = {
        flow: source.flows[d].v,
        i: {
          q: source.flows[d].f,
          f: s,
          t: d
        }
      };
    }
    src[s] = source;

    src_values.max = Math.max(source.flow, src_values.max);
    src_values.min = Math.min(source.flow, src_values.min);
  }
  Object.values(dst).forEach(d => {
    d.flows = Object.values(d.flows)
      .sort((a, b) => b.flow - a.flow)
      .reduce((acc, d) => {
        acc[d.src] = d;
        return acc;
      }, {})
  })

  var min = Math.min(src_values.min, dst_values.min);
  var max = Math.max(src_values.max, dst_values.max);
  // console.log(`[${min},${max}]`)
  const colorScale = d3.scaleLinear().range([0, 1]).domain([min, max / 10]);
  const getHSL = (rgb) => {
    const hsl = d3.hsl(rgb);
    return `${hsl.h},${hsl.s * 100}%,${hsl.l * 100}%`;
  }
  var tot_from = 0, tot_to = 0;
  for (var s in src) {
    // src[s].color = colors.getHSL(Math.round(Math.map(src[xs].flow, min, max, 110, 10)));
    // console.log(s, src[s].flow, colorScale(src[s].flow))
    // src[s].color = getHSL(d3.interpolateReds(colorScale(src[s].flow))); // colors.getHSL(Math.round(logscale(src[s].flow, 0, max / 2, 120, 1)));
    // src[s].color = colors.getHSL(Math.round(logscale(src[s].flow, 0, max / 2, 120, 1)));
    // console.log('s', s, colors.getHSL(continentColors[s]), '-', colorScale(src[s].flow))
    const hsl = d3.hsl(continentColors[src[s].continent]);
    src[s].color = `${hsl.h},100%,50%`; // colors.getHSL(continentColors[s]);
    src[s].hex = continentColors[src[s].continent];
    src[s].color = `${Math.round(hsl.h)},${Math.round(hsl.s * 100)}%,${Math.round(hsl.l * 100)}%`; // colors.getHSL(continentColors[s]);
    // console.log('s', s, continentColors[s], src[s].color, d3.hsl(continentColors[s]))
    tot_from += src[s].flow + step;
  }
  for (var d in dst) {
    //dst[d].color=colors.getColor(Math.round(Math.map(dst[d].flow,dst_values.min,dst_values.max,50,colors.length-50)));
    // dst[d].color = colors.getHSL(Math.round(Math.map(dst[d].flow, min, max, 110, 10)));
    // dst[d].color = getHSL(d3.interpolateReds(colorScale(dst[d].flow))); // colors.getHSL(Math.round(logscale(dst[d].flow, 0, max / 2, 120, 1)));
    const hsl = d3.hsl(continentColors[dst[d].continent]);
    // dst[d].color = `${hsl.h},100%,50%`; // colors.getHSL(continentColors[s]);
    dst[d].color = `${hsl.h},${hsl.s * 100}%,${hsl.l * 100}%`; // colors.getHSL(continentColors[s]);
    dst[d].hex = continentColors[dst[d].continent];
    tot_to += dst[d].flow + step;

  }

  // dst = iterateSorted(dst, label_reference);
  dst = iterateSorted(dst);

  return {
    from: tot_from,
    to: tot_to,
    src,
    dst,
  };
}
