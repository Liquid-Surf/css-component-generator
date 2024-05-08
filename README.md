# CSS component generator

Based on CSS' Hello World example component, this repo allow to generate a CSS component. Basically, I was tired of renaming all the 'hello world' variable in the component example, so I created a script to automate this process. 

# Usage

Add the following to your shell config ( .bashrc, .zshrc .. )
`export PATH="$PATH:/path/to/css-component-generator/bin"`

Then, reload your shell and run : 

`create-css-component my-component-name`

# TODOs

 - replace bash script to js script
   - convert bash to  zx
   - use commander to parse args  ( --template ) 
   - use inquirer 
     - ask for component name
     - select template
     - add tests or not
 - refactor template and script to use placeholder instead of `hello world`s
   - ask for each placeholder with inquier ( module name, class name etc..)
 - add more templates
   - API endpoint 
   - html template 
