import type { HLJSApi } from 'highlight.js';

/**
  example use:
  import { hljsDefineVue } from '@/lib/highlightjs-vue';
  hljs.registerLanguage('vue', hljsDefineVue);
*/
export function hljsDefineVue(hljs: HLJSApi) {
  return {
    subLanguage: 'xml',
    contains: [
      hljs.COMMENT('<!--', '-->', {
        relevance: 10,
      }),
      {
        begin: /^(\s*)(<script>)/gm,
        end: /^(\s*)(<\/script>)/gm,
        subLanguage: 'javascript',
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: /^(\s*)(<script lang=["']ts["']>)/gm,
        end: /^(\s*)(<\/script>)/gm,
        subLanguage: 'typescript',
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: /^(\s*)(<style(\sscoped)?>)/gm,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: 'css',
        excludeBegin: true,
        excludeEnd: true,
      },
    ],
  };
}

/**
  example use:
  import hljsDefineVue from '@/lib/highlightjs-vue';
  hljsDefineVue(hljs);
*/
export default function (hljs: HLJSApi) {
  hljs.registerLanguage('vue', hljsDefineVue);
}
