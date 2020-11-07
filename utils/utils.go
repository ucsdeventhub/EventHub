package utils

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"strconv"
)

func SecretCode(length int) (string, error) {
	if length == 0 {
		return "", nil
	}

	max := big.NewInt(0).Exp(
		big.NewInt(10),
		big.NewInt(int64(length)),
		nil,
	)

	r, err := rand.Int(rand.Reader, max)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%0"+strconv.Itoa(length)+"d", r), nil

}
