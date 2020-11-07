package sqlite

import (
	"context"
	"database/sql"
	"errors"

	"github.com/mattn/go-sqlite3"

	"github.com/ucsdeventhub/EventHub/database"
)

func NewFactory(fname string) (*Factory, error) {
	db, err := sql.Open("sqlite3", fname+"?_foreign_keys=true")
	if err != nil {
		return nil, err
	}

	return &Factory{
		db: db,
	}, nil
}

type Factory struct {
	db *sql.DB
}

// hacky shared interface between tx and non-tx
type querier interface {
	QueryContext(ctx context.Context,
		query string, args ...interface{}) (*sql.Rows, error)

	QueryRowContext(ctx context.Context,
		query string, args ...interface{}) *sql.Row

	ExecContext(ctx context.Context,
		query string, args ...interface{}) (sql.Result, error)
}

type querierFacade struct {
	// storing the context in a struct is usually considered bad paractice
	// but this object is meant to have request scope so it's ok
	ctx context.Context
	q   querier
}

func mapErr(err error) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, sql.ErrNoRows) {
		return database.ErrNoRows
	}

	if v, ok := err.(sqlite3.Error); ok &&
		v.Code == sqlite3.ErrConstraint &&
		v.ExtendedCode == sqlite3.ErrConstraintForeignKey {
		return database.ErrFK
	}

	return err
}

func (q *querierFacade) Query(query string, args ...interface{}) (*sql.Rows, error) {
	rows, err := q.q.QueryContext(q.ctx, query, args...)
	return rows, mapErr(err)
}

type RowDecorator struct {
	inner sql.Row
}

/* Go 1.15, I should update...
func (row *RowDecorator) Err() error {
	return mapErr((&row.inner).Err())
}
*/

func (row *RowDecorator) Scan(dest ...interface{}) error {
	return mapErr(row.inner.Scan(dest...))
}

func (q *querierFacade) QueryRow(query string, args ...interface{}) *RowDecorator {
	return &RowDecorator{inner: *q.q.QueryRowContext(q.ctx, query, args...)}
}

func (q *querierFacade) Exec(query string, args ...interface{}) (sql.Result, error) {
	res, err := q.q.ExecContext(q.ctx, query, args...)
	return res, mapErr(err)
}

func (fac *Factory) NonTx(ctx context.Context) database.Provider {
	return &querierFacade{
		ctx: ctx,
		q:   fac.db,
	}
}

type txFacade struct {
	querierFacade
	tx *sql.Tx
}

func (tx *txFacade) Commit() error {
	return tx.tx.Commit()
}

func (tx *txFacade) Rollback() error {
	return tx.tx.Rollback()
}

func (fac *Factory) WithTx(ctx context.Context,
	fn func(p database.TxProvider) error) error {
	// also usually bad practice but the error will (probably)
	// show up later
	tx, err := fac.db.Begin()
	if err != nil {
		return err
	}

	defer tx.Rollback()

	return fn(&txFacade{
		querierFacade: querierFacade{
			ctx: ctx,
			q:   tx,
		},
		tx: tx,
	})
}
