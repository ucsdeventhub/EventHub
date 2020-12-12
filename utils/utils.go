package utils

import (
	"crypto/md5"
	"crypto/rand"
	"fmt"
	"image"
	"image/color"
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

func StringHashImage(s string, r image.Rectangle) image.Image {
	hash := md5.Sum([]byte(s))
	img := image.NewRGBA(r)

	colors := make([]color.RGBA, 4)
	for i := range colors {
		colors[i] = color.RGBA{hash[3*i], hash[3*i+1], hash[3*i+2], 255}
	}

	for i, c := range colors {

		var dx, dy int
		switch i {
		case 0:
			// noop
		case 1:
			dx = 100
		case 2:
			dy = 100
		case 3:
			dx = 100
			dy = 100
		}

		for x := dx; x < 100+dx; x++ {
			for y := dy; y < 100+dy; y++ {
				img.Set(x, y, c)
			}
		}
	}

	return img
}
