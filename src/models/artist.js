module.exports = (sequelize, DataTypes) => {
  const schema = {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  };

  const indexes = [{
    unique: true,
    fields: ['name'],
  }];

  const Artist = sequelize.define('artist', schema, {
    indexes,
    classMethods: {
      associate: (models) => {
        models.Artist.belongsToMany(models.Track, { through: 'artist-track' });
      },
    },
  });

  return Artist;
};
