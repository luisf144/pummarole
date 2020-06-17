<?php

namespace App\DataFixtures;

use App\Entity\Settings;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class SettingsFixtures extends BaseFixtures
{
    protected function loadData(ObjectManager $manager)
    {
        //Define an array
        define('SETTINGS_DEFAULT', [
            //SLUG              //DESCRIPTION                                  //VALUE
            ['pomodoro_cycle', 'Number of Pomdoro nedded to completed a cycle.', 4],
            ['PM', 'Pomodoro', 25],
            ['SB', 'Short Break', 5],
            ['LB', 'Long Break', 15],
        ]);

        $arr = SETTINGS_DEFAULT;

        //Callback for each iteration of 'createMany' and got index from that
        //Need to return and object of the entity to be persist
        $setVal = function ($i) use ($arr) {
            $setting = new Settings();
            $setting->setSlug($arr[$i][0]);
            $setting->setDescription($arr[$i][1]);
            $setting->setValue($arr[$i][2]);

            return $setting;
        };

        $this->createMany(count($arr), $setVal);
        $manager->flush();
    }
}
