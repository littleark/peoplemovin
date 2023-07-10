<script>
import { onMount, afterUpdate } from 'svelte';
// import {Flows} from './pm/MigrationFlows.js'
import FlowsWrapper from './pm/FlowsWrapper.svelte';


// console.log('Flows', Flows)
// const flows = new Flows()
// flows.init();

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
    <div id="flows_container" class="canvas_container clearfix">
        {#if windowWidth}
       	    <p>{windowWidth}</p>
        {/if}
        <!--<div id="flows">
            <div id="sources"/>
            <canvas width="100%" class="datamovin"></canvas>
            <div id="destinatons"/>
        </div>-->
        <FlowsWrapper />
        <div id="src_title" class="ititle"></div>
        <div id="dst_title" class="ititle"></div>
        <div id="tooltip">
            <div>
                <span id="flow"></span> people have moved from
                <span id="from"></span>
                to <span id="to"></span>
            </div>
        </div>
    </div>
</main>

<style>
    .datamovin canvas#flows {
        width: 100%;
    }
</style>
