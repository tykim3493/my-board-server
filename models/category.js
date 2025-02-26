module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define(
        "category",
        {
            category: {
                type: DataTypes.STRING,
            },
        },
        { timestamps: false, freezeTableName: true }
    )

    Category.associate = (models) => {
        Category.hasMany(models.board, { foreignKey: "categoryId" })
    }

    return Category;
}