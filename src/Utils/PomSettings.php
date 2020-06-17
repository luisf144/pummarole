<?php

namespace App\Utils;

use App\Entity\Settings;

class PomSettings
{
    private $pom;
    private $sb;
    private $lb;
    private $pomCycle;
    private static $slugsDefault = ['pomodoro_cycle', 'PM', 'SB', 'LB'];

    /**
     * @return mixed
     */
    public function getPom()
    {
        return $this->pom;
    }

    /**
     * @param mixed $pom
     */
    public function setPom($pom)
    {
        $this->pom = $pom;
    }

    /**
     * @return mixed
     */
    public function getSb()
    {
        return $this->sb;
    }

    /**
     * @param mixed $sb
     */
    public function setSb($sb)
    {
        $this->sb = $sb;
    }

    /**
     * @return mixed
     */
    public function getLb()
    {
        return $this->lb;
    }

    /**
     * @param mixed $lb
     */
    public function setLb($lb)
    {
        $this->lb = $lb;
    }

    /**
     * @return mixed
     */
    public function getPomCycle()
    {
        return $this->pomCycle;
    }

    /**
     * @param mixed $pomCycle
     */
    public function setPomCycle($pomCycle)
    {
        $this->pomCycle = $pomCycle;
    }

    public function getSlugsByDefault()
    {
        return self::$slugsDefault;
    }

    public function populate(array $settings)
    {
        foreach ($settings as $setting){
            $pomCycle = $this->getValFromSlug($setting, self::$slugsDefault[0]);
            $pom = $this->getValFromSlug($setting, self::$slugsDefault[1]);
            $sb = $this->getValFromSlug($setting, self::$slugsDefault[2]);
            $lb = $this->getValFromSlug($setting, self::$slugsDefault[3]);

            if($lb && $lb !== '')
                $this->lb = $lb;

            if($sb && $sb !== '')
                $this->sb = $sb;

            if($pom && $pom !== '')
                $this->pom = $pom;

            if($pomCycle && $pomCycle !== '')
                $this->pomCycle = $pomCycle;
        }
    }

    public function getValFromSlug(Settings $setting, string $slug): string
    {
        return $setting->getSlug() === $slug ? $setting->getValue() : '';
    }
}
