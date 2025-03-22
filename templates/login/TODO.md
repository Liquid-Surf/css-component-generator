

 - use arrays in the "controls" api like in https://github.com/ksaito-hiu/css-google-auth/blob/75d22010ea1de29a0aab3016d7b60efe35c5f454/config/identity/handler/routing/google/main.json#L22C2-L36C7
 - rename template-name for 'hello-world' or any placeholder
 - clean
   - I don't think src/CreateMathPasswordHandler.ts is well integrated in the config, or at least it doesn't show in the control ( and maybe doesn't have an api endpoint )
   - either:
     - remove it and maybe a login only plugin
     - or/and create a new template full featured ( lgin + registration + ... )
     - also mayby the reset, forgot ?
 - add test
