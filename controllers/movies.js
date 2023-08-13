const Movie = require('../models/movie');
const { responseСodes } = require('../utils/responseСodes');
const BadRequestErr = require('../errors/BadRequestErr');
const ForbiddenErr = require('../errors/ForbiddenErr');
const NotFoundErr = require('../errors/NotFoundErr');

const getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.send(movies))
    .catch(next);
};

const createMovie = (req, res, next) => {
  const owner = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner,
  })
    .then((movie) => res.status(responseСodes.created).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestErr('Переданы некорректные данные !'));
      } else {
        next(err);
      }
    });
};

const deleteMovie = (req, res, next) => {
  const removeMovie = () => {
    Movie.findByIdAndRemove(req.params.movieId)
      .then((movie) => res.send(movie))
      .catch(next);
  };
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (movie === null) {
        throw new NotFoundErr('Фильм не найден !');
      } else if (movie.owner.toString() !== req.user._id) {
        throw new ForbiddenErr('Только владелец фильма может его удалить !');
      } else {
        removeMovie();
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestErr('Передан некорретный Id фильма !'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
