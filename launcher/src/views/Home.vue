<template>
  <v-container>
    <!--<v-btn @click="download_build(sample_build)">Download a build</v-btn>-->
    <v-autocomplete :items="build_feed" label="Build" solo :filter="build_search" v-model="current_build">
      <template v-slot:selection="{item,index}">
        <span> {{item.major}}-{{item.minor}}-{{item.patch}} </span>
      </template>
      <template v-slot:item="{item,index}">
        <span> {{item.major}}-{{item.minor}}-{{item.patch}} </span>
      </template>
    </v-autocomplete>
    <v-btn @click="run_game()" :disabled="is_run_disabled"> Run Game </v-btn>
    <v-progress-linear :value="download_progress" color="red"/>
    <v-container>
      <div>
        Progress: {{download_progress}}
      </div>
      <div>
        Total: {{download_total}}
      </div>
      <div>
        Loaded: {{download_current_size}}
      </div>
    </v-container>
  </v-container>
</template>

<script>
  import game from '../gamedata.js';
  import {axios} from '../firebase';
  import Neutralino from '../neutralino';
  export default {
    name: 'Home',

    components: {
    },
    data:()=>({
      download:false,
      download_progress:0,
      download_current_size:0,
      download_total:0,
      feed_url:'http://localhost:2000/builds/list',
      build_feed:[],
      current_build:null,
      build_present:false,
      //sample_build: 'https://jsonplaceholder.typicode.com/posts/1',
      //sample_build: 'http://localhost:3000/builds/1-1-1.zip',
      //proxy_url: 'http://localhost:3000/proxy?url=',
      sample_build: 'https://firebasestorage.googleapis.com/v0/b/universal-launcher.appspot.com/o/builds%2FBGFQoVMWXJddCnnOsSSXoe0n1Xj2%2FZC4n2dQnierJdp8mlaC8%2F4xVBn3Jva6KY5l9uWuXG.zip?alt=media&token=6a6da3ab-99cd-4079-ba68-d90b3f72de04',
    }),
    async created(){
      try {
        this.setup_feed();
      } catch(e) {
        // load form local file or something
      }
    },
    computed:{
      is_run_disabled() {
        return this.current_build == null;
      },
    },
    watch: {
      current_build(new_build){
        console.log(new_build);
        this.build_change(new_build);
      }
    },
    methods:{
      async build_change(build){
        const version = `${build.major}-${build.minor}-${build.patch}`;
        let found = false;
        try {
          const current = await Neutralino.api.filesystem.readFile('./build.txt');
          console.log(current, version);
          if (current == version) {
            found = true;
          } else {
            found = false;
          }
        } catch(e) {
          found = false;
        }
        this.build_present = found;
        
      },
      build_search(item,query,text){
        const build = `${item.major}-${item.minor}-${item.patch}`.toLowerCase();
        query = query.toLowerCase();
        return build.includes(query)
      },
      async setup_feed(){
        const feed_download = await axios.get(this.feed_url,{validateStatus:false,});
        console.log(feed_download);
        this.build_feed.push(...feed_download.data);
        try {
          const version = await Neutralino.api.filesystem.readFile('./build.txt');
          console.log(version);
        } catch(e) {
          // can't find verison, assume no build present
        }

      },
      async download_build(url,build){
        const download = await axios.get(url,{
            responseType: 'blob',
            onDownloadProgress: this.download_update_progress,
            headers: {
              accept: 'application/zip',
            }
        });
        console.log(download);
        try {
          await Neutralino.api.filesystem.createDirectory('./game');
        } catch(e) {
          console.log('Folder already exists, we\'re good');
        }
        console.log(await Neutralino.api.filesystem.writeBinaryFile('./game/build.zip',await download.data.arrayBuffer()));
        const blob = new Blob([download.data],{type: "application/zip"});
        await Neutralino.api.os.execCommand('powershell -command "Expand-Archive -Force ./game/build.zip ./game"');
        await Neutralino.api.filesystem.removeFile('./game/build.zip');
        await Neutralino.api.filesystem.writeFile('./build.txt',`${build.major}-${build.minor}-${build.patch}`);
        
      },
      download_update_progress(e){
        this.download_progress = (e.loaded/2220412)*100;
        this.download_current_size = e.loaded;
        this.download_total = e.total;
      },
      async run_game(){
        if (!this.build_present) {
          await this.download_build(this.current_build.url,this.current_build);
        }
        await Neutralino.api.os.execCommand(`start ./game/run-ducky-run-gms23.exe`);
      }
    },
  }
</script>
