# Generated by Django 5.0.1 on 2024-02-19 05:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0006_alter_categoria_descripcion'),
    ]

    operations = [
        migrations.AddField(
            model_name='categoria',
            name='url_redireccion',
            field=models.CharField(max_length=500, null=True),
        ),
    ]
