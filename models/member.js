module.exports = (sequelize, DataTypes) => {
    const Member = sequelize.define(
        "member",
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
            },
            password: {
                type: DataTypes.STRING,
            },
        },
        { timestamps: true, freezeTableName: true }
    )

    Member.associate = (models) => {
        Member.hasMany(models.board, { foreignKey: "memberId", sourceKey: "id"})
    }

    return Member;
}