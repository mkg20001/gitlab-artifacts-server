# gitlab-artifacts-server

A simple server that service artifacts for a specific branch of a project

## Usage

```
Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --host     Host to listen on                          [string] [default: "::"]
  --port     Port to listen on                          [number] [default: 5236]
  --branch   Branch to fetch artifacts for                   [string] [required]
  --tag      Fetch tags instead of branches                            [boolean]
  --token    Private access token                            [string] [required]
  --url      GitLab Instance URL        [string] [default: "https://gitlab.com"]
  --project  GitLab Project ID                               [string] [required]
  --webhook  Enable /checkUpdate route with webhook X-Secret header     [string]

Following arguments are required: branch, token, project
```
