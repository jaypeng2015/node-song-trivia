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

  const Track = sequelize.define('track', schema, {
    indexes,
  });

  Track.associate = function associate(models) {
    models.Track.belongsToMany(models.Artist, { through: 'artist-track' });
  };

  return Track;
};
