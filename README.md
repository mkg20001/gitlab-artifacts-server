# gitlab-artifacts-server

A simple server that serves artifacts for a specific branch of a project

## Installation

Install it with `npm i -g gitlab-artifacts-server` or as a snap with `snap install gitlab-artifacts-server`

No db required! Batteries included! Just launch and forget!

## Usage

Example: `$ gitlab-artifacts-server --token YOURTOKENHERE --project 13083 --branch master --job compile-assets`

This fetches the compile-assets artifact from the gitlab repo's master branch

```
Options:
  --help          Show help                                            [boolean]
  --version       Show version number                                  [boolean]
  --host          Host to listen on                     [string] [default: "::"]
  --port          Port to listen on                     [number] [default: 5236]
  --url           GitLab Instance URL   [string] [default: "https://gitlab.com"]
  --token         Private access token                       [string] [required]
  --project       GitLab Project ID                          [string] [required]
  --branch        Branch to fetch artifacts for              [string] [required]
  --job           Name of job that produces the artifacts    [string] [required]
  --tag           Fetch tags instead of branches                       [boolean]
  --webhook       Enable /checkUpdate route with webhook X-Secret header[string]
  --prefix        Prefix to append to URL (allows serving multiple projects over
                  one instance)                          [string] [default: "/"]
  --access-token  Basic authentication token required for access        [string]
  --path          Path to load from artifact                            [string]
  --interval      Interval to check for updates      [number] [default: 3600000]

Following arguments are required: token, project, branch, job
```

You can also serve multiple projects like this:
```
$ gitlab-artifacts-server --token YOURTOKENHERE \
  --project 1 --branch master --job build --prefix /project-1-release \
  --project 1 --branch dev    --job build --prefix /project-1-dev \
  --project 2 --branch master --job build --prefix /project-2-release \
```
