<?php
/**
 * Created by PhpStorm.
 * User: luiscarbajal
 * Date: 27/05/2020
 * Time: 17:31
 */

namespace App\DataFixtures;


use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

abstract class BaseFixtures extends Fixture
{

    /** @var ObjectManager */
    private $manager;

    abstract protected function loadData(ObjectManager $manager);

    public function load(ObjectManager $manager)
    {
        $this->manager = $manager;
        $this->loadData($manager);
    }

    /*
     * Create many objects at once
     * */
    protected function createMany(int $count, callable $fn)
    {
        for ($i = 0; $i < $count; $i++){
            //Get the entity
            $entity = $fn($i);

            if (null === $entity){
                throw new \LogicException('Did you forget to return the entity object from your Callback.');
            }

            $this->manager->persist($entity);
        }
    }
}