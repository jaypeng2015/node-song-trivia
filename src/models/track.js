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

  const Track = sequelize.define('track', schema, {
    classMethods: {
      associate: (models) => {
        models.Track.belongsToMany(models.Artist, { through: 'artist-track' });
      },
    },
  });

  return Track;
};
