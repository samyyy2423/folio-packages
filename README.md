# Folio packages

The package index for [Folio](https://github.com/samyyy2423/folio), the programming language that reads like
plain English. `folio search` and `folio add <name>` read [`index.json`](index.json) from here.

```text
folio search json         lists the packages with "json" in their name or description
folio add greeter         adds the package called greeter to your program's folder
```

Then, in your program:

```
use the package "greeter"
```

## Publishing a package

A Folio package is a Git repository. Its main file is named after the package and sits at the top of the
repository: a package called `greeter` has `greeter.folio`. It can use other files beside it, and other
packages, listed in a `folio.packages` of its own.

To put it in the index:

1. Push the package to a public Git repository.
2. Fork this repository and add an entry to `index.json`, keeping the names in alphabetical order:

   ```json
   {
     "packages": {
       "greeter": {
         "repository": "github.com/someone/greeter",
         "about": "Says hello to anyone"
       }
     }
   }
   ```

   - The name is lowercase letters, digits and `_`, starting with a letter.
   - `repository` is what you would give `folio add`: `github.com/someone/thing`, or a full address.
   - `about` is one line, at most 100 characters.

3. Open a pull request. A check makes sure the file is valid, and that a GitHub repository has the package's
   main file.

`folio add` pins a package at the commit it fetched, in the program's `folio.packages`, so a new commit in a
package never changes a program until its author runs `folio update`.

## License

Apache License 2.0, as Folio is. Each package has its own license, in its own repository.
