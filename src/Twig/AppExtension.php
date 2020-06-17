<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

class AppExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            new TwigFilter('type', [$this, 'convertSlugTypeToName']),
        ];
    }

//    public function getFunctions(): array
//    {
//        return [
//            new TwigFunction('convertSlug', [$this, 'convertSlugTypeToName']),
//        ];
//    }

    public function convertSlugTypeToName($type): string
    {
        switch ($type){
            case 'PM':
                return "Pomodoro";
                break;

            case 'SB':
                return "Short Break";
                break;

            case 'LB':
                return "Long Break";
                break;
        }

        return $type;
    }
}
