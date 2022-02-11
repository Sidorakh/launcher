import {firestore} from './firebase';
import Neutralino from './neutralino';

async function get_game_data() {
    const data = (await firestore.collection('games').doc('ZC4n2dQnierJdp8mlaC8').get()).data();
    return data;
}
async function list_builds() {
    const query = await firestore.collection('games').doc('ZC4n2dQnierJdp8mlaC8').collection('builds').orderBy('created','asc').get();
    const builds = [];
    for (const build of query.docs) {
        builds.push(build.data());
    }
    return builds;
}
export default {
    get_game_data,
    list_builds,
}