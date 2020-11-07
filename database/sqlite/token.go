package sqlite

func (q querierFacade) GetTokenRequestByEmail(email string) (string, error) {
	query := `SELECT secret
	FROM token_requests
	WHERE
		email = ?;
	`

	var token string
	err := q.QueryRow(query, email).Scan(&token)
	return token, err
}

func (q querierFacade) DeleteTokenRequestByEmail(email string) error {
	query := `DELETE FROM token_requests WHERE email = ?;`

	_, err := q.Exec(query, email)
	return err
}

func (q querierFacade) AddTokenRequestForEmail(email, secret string) error {
	query := `INSERT INTO token_requests (email, secret)
	VALUES
		(?, ?)
	ON CONFLICT (email) DO UPDATE SET
		secret=excluded.secret;
	`

	_, err := q.Exec(query, email, secret)
	return err
}
