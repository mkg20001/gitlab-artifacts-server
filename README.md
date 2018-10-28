# gitlab-artifacts-server

A simple server that serves artifacts for a specific branch of a project

## Usage

```
Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --host     Host to listen on                          [string] [default: "::"]
  --port     Port to listen on                          [number] [default: 5236]
  --url      GitLab Instance URL        [string] [default: "https://gitlab.com"]
  --token    Private access token                            [string] [required]
  --project  GitLab Project ID                               [string] [required]
  --branch   Branch to fetch artifacts for                   [string] [required]
  --job      Name of job that produces the artifacts         [string] [required]
  --tag      Fetch tags instead of branches                            [boolean]
  --webhook  Enable /checkUpdate route with webhook X-Secret header     [string]

Following arguments are required: token, project, branch, job
```
