# EventHub


## Running

The go toolchain is required to run this application. Instrctions to install
it [here](https://golang.org/doc/install).


Optionally, you can install the sqlite3 cli.

Then to run the server:

```
# initialize database
# ./docs/sql/init.sh test.sqlite3
# or
cp docs/sql/schema.sqlite3 db.sqlite3
go run ./cmd/eventhub/main.go
```

Optionally the `EVENTHUB_SENDGRID_API_KEY` environment variable can be provided
to enable the email provider. Otherwise, in dev builds the code `1010` can be
used in the email verification step.

## Testing

Testing still needs to be written; but for now a DB test suite allows for
simple visual confimation that operations are executed correctly.

## Architecture

The server architechture makes heavy use of the
[strategy](https://en.wikipedia.org/wiki/Strategy_pattern) or
[provider](https://en.wikipedia.org/wiki/Provider_model) patterns. Also central
to the application are the `models`.

The models define the objects in the system, in general they flow between the
front end and the database with the server in between to make sure that the
models are valid and to translate between formats like json. Models, along with
Go's primiteves are used to communicate between the various models.

The providers are defined by interfaces and implemented in separate, vendor-specific
packages. This way, new providers can be implemented or old ones refactored with
confidence. One simple example of a provider interface, implementation, use is
the email provider. The key thing to note is that in `cmd/eventhub/main.go` an
`sendgrid.Provider` is used but the `api.Provder` is only concerned with the
limited `email.Provider` interface.


