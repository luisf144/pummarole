<?php

namespace App\Form;

use App\Utils\PomSettings;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class SettingsFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('pomCycle', IntegerType::class, [
                'label' => 'Pomodoro Cycle',
                'constraints' => [
                    new NotBlank([
                        'message' => 'The Pomodoro Cycle value cannot be empty.'
                    ]),
                    new Length([
                        'max' => 2,
                        'maxMessage' => 'The Pomodoro Cycle value can only be {{ limit }} numbers long.'
                    ])
                ]
            ])

            ->add('pom', IntegerType::class, [
                'label' => 'Pomodoro',
                'constraints' => [
                    new NotBlank([
                        'message' => 'The Pomodoro value cannot be empty.'
                    ]),
                    new Length([
                        'max' => 2,
                        'maxMessage' => 'The Pomodoro value can only be {{ limit }} numbers long.'
                    ])
                ]
            ])

            ->add('sb', IntegerType::class, [
                'label' => 'Short Break',
                'constraints' => [
                    new NotBlank([
                        'message' => 'The Short Break value cannot be empty.'
                    ]),
                    new Length([
                        'max' => 2,
                        'maxMessage' => 'The Short Break value can only be {{ limit }} numbers long.'
                    ])
                ]
            ])

            ->add('lb', IntegerType::class, [
                'label' => 'Long Break',
                'constraints' => [
                    new NotBlank([
                        'message' => 'The Long Break value cannot be empty.'
                    ]),
                    new Length([
                        'max' => 2,
                        'maxMessage' => 'The Long Break value can only be {{ limit }} numbers long.'
                    ])
                ]
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => PomSettings::class,
        ]);
    }
}
