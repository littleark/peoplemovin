<script>
import { onMount, afterUpdate } from 'svelte';
// import {Flows} from './pm/MigrationFlows.js'
import FlowsWrapper from './pm/FlowsWrapper.svelte';
import LineChart from './pm/LineChart.svelte';

let windowWidth;

const debounce = (func, delay) => {
	let timer;

	return function () {
		const context = this;
		const args = arguments;
		clearTimeout(timer);
		timer = setTimeout(() => func.apply(context, args), delay);
	};
};

const setWindowWidth = () => {
	windowWidth = `${window.innerWidth}px`;
};

const debouncedSetWindowWidth = debounce(setWindowWidth, 300);

onMount(() => {
	// window.addEventListener('resize', debouncedSetWindowWidth);
	// return () => {
//		window.removeEventListener('resize', debouncedSetWindowWidth);
	//}
});

afterUpdate(() => {
   // console.log(windowWidth)
   // flows.update();
});
</script>

<main>
        <section>
            <p class="standfirst">
                Over <b>280 million</b> individuals — around <b>{Math.round(280598105 / 7821000000 * 100 * 100)/100}%</b> of the world's population — are living outside their country of origin.
            </p>
            <p>
                Data from <b>United Nations Department of Economic and Social Affairs, Population Division (2020)</b> suggests that between 2000 and 2010, the number of international migrants increased by 48 million globally, with another 60 million added between 2010 and 2020. Much of this increase was due to labour or family migration. Humanitarian crises in many parts of the world also contributed, with an increase of 17 million in the number of refugees and asylum seekers between 2000 and 2020. In 2020, the number of persons forcibly displaced across national borders worldwide stood at 34 million, double the number in 2000.
            </p>
            <p>
            <LineChart data={[
                {
                    year: 1990,
                    value:152986157},
                {
                    year: 1995,
                    value:161289976},
                {
                    year: 2000,
                    value:173230585},
                {
                    year: 2005,
                    value:191446828},
                {
                    year: 2010,
                    value:220983187},
                {
                    year: 2015,
                    value:247958644},
                {
                    year: 2020,
                    value:280598105}]}
                fields={['year','value']}
            />
            </p>
            <p>
                Europe and Asia each hosted around 87 and 86 million international migrants, respectively – comprising 61% of the global international migrant stock.<br/>
                These regions were followed by North America, with almost 59 million international migrants in 2020 or 21 percent of the global migrant stock, Africa at 9 per cent, Latin America and the Caribbean at 5 per cent, and Oceania at 3 percent.
            </p>
            <FlowsWrapper showContinents={true} preselected={[{country:'EUROPE', direction:'to'},{country:'ASIA', direction:'to'}]}/>
        </section>
        <section>
            <h3>Country by country</h3>
            <p>
                Although there are only a small proportion of the world's population overall who are international migrants (3.59%), there exists wide variation at the country level. In some countries, such as United Arab Emirates, over 88% of the population are international migrants.
            </p>
            <p>
                Multiple factors have shaped migration “corridors” over the years.
                Long-term data shows that international migration is not uniform across the world but is shaped by economic, geographic, demographic and other factors resulting in distinct migration patterns, such as migration “corridors” developed over many years.
                <br/><br/>
                Migration corridors represent an accumulation of migratory movements over time and provide a snapshot of how migration patterns have evolved into significant foreign-born populations in specific destination countries
            </p>
            <FlowsWrapper showContinents={false} />
        </section>
        <section>
            <h3>Data</h3>
            <p>United Nations Department of Economic and Social Affairs, Population Division (2020). International
Migration 2020 Highlights (ST/ESA/SER.A/452).</p>
        </section>
        <div id="src_title" class="ititle"></div>
        <div id="dst_title" class="ititle"></div>
        <div id="tooltip">
            <div>
                <span id="flow"></span> people have moved from
                <span id="from"></span>
                to <span id="to"></span>
            </div>
        </div>
</main>

<style>
    main {
        margin: 50px auto;
        max-width: 1200px;
    }
    .datamovin canvas#flows {
        width: 100%;
    }
    section p {
        font-family: sans-serif;
    }
    section p,
    section h3 {
        width: calc(100% - 300px);
        margin: 10px auto;
    }
    section h3 {
        font-family: 'Arvo';
        font-size: 24px;
        line-height: 26px;
        margin: 30px auto;
    }
    section p.standfirst {
        font-family: 'Arvo';
        font-size: 24px;
        line-height: 36px;
        margin: 30px auto;
    }
    section p b {
        color: #00F2FF;
    }
</style>
